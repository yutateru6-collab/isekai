import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outDir = path.resolve('ui-audit');
await mkdir(outDir, { recursive: true });

const chrome = process.env.CHROME_PATH || 'google-chrome';
const port = 9222;
const chromeProc = spawn(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  `--remote-debugging-port=${port}`,
  '--user-data-dir=/tmp/isekai-ui-audit-chrome',
  'about:blank'
], { stdio: ['ignore', 'pipe', 'pipe'] });

chromeProc.stdout.on('data', d => process.stdout.write(d));
chromeProc.stderr.on('data', d => process.stderr.write(d));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${port}/json/list`).then(r => r.json());
      const page = list.find(x => x.type === 'page');
      if (page?.webSocketDebuggerUrl) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error('Chrome DevTools endpoint did not become ready');
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
  }
  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true });
      this.ws.addEventListener('error', reject, { once: true });
    });
    this.ws.addEventListener('message', event => {
      const msg = JSON.parse(event.data);
      if (msg.id) {
        const p = this.pending.get(msg.id);
        if (!p) return;
        this.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
        else p.resolve(msg.result);
        return;
      }
      const waiters = this.events.get(msg.method);
      if (waiters?.length) {
        this.events.set(msg.method, []);
        for (const resolve of waiters) resolve(msg.params);
      }
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  waitEvent(method, timeout = 10000) {
    return Promise.race([
      new Promise(resolve => {
        const arr = this.events.get(method) || [];
        arr.push(resolve);
        this.events.set(method, arr);
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), timeout))
    ]);
  }
}

const target = await getTarget();
const cdp = new CDP(target.webSocketDebuggerUrl);
await cdp.open();
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Network.enable');

const appUrl = process.env.AUDIT_URL || 'http://127.0.0.1:4173';

async function setViewport(width, height, mobile = false) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height
  });
}

async function navigate(url = appUrl) {
  const loaded = cdp.waitEvent('Page.loadEventFired', 15000).catch(() => null);
  await cdp.send('Page.navigate', { url });
  await loaded;
  for (let i = 0; i < 50; i++) {
    const { result } = await cdp.send('Runtime.evaluate', {
      expression: 'document.readyState',
      returnByValue: true
    });
    if (result.value === 'complete') break;
    await sleep(100);
  }
  await sleep(800);
}

async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (exceptionDetails) throw new Error(exceptionDetails.text || 'Runtime.evaluate failed');
  return result.value;
}

async function screenshot(name) {
  const result = await cdp.send('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFile(path.join(outDir, name), Buffer.from(result.data, 'base64'));
}

async function clickText(text) {
  return evaluate(`(() => {
    const target = [...document.querySelectorAll('button,a')].find(el => (el.textContent || '').includes(${JSON.stringify(text)}));
    if (!target) return false;
    target.click();
    return true;
  })()`);
}

async function setProgress(progress) {
  await evaluate(`localStorage.setItem('parallel-zukan-save-v2', ${JSON.stringify(JSON.stringify(progress))})`);
  await navigate(appUrl);
}

async function enterGame(progress) {
  await setProgress(progress);
  const entered = await clickText('つづきから');
  if (!entered) throw new Error('Could not find continue button');
  await sleep(500);
}

async function collectMetrics(label) {
  const metrics = await evaluate(`(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const buttons = [...document.querySelectorAll('button')].map(b => {
      const r = b.getBoundingClientRect();
      return { text: (b.textContent || '').trim().replace(/\\s+/g,' ').slice(0,80), w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
    });
    const smallTargets = buttons.filter(b => b.w < 44 || b.h < 44);
    const imgs = [...document.images].map(img => ({ alt: img.alt, src: img.currentSrc || img.src, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight }));
    return {
      viewport: { width: vw, height: vh },
      bodyScrollWidth: document.body.scrollWidth,
      bodyScrollHeight: document.body.scrollHeight,
      horizontalOverflow: document.body.scrollWidth > vw + 1,
      smallTargets,
      buttons,
      imagesBroken: imgs.filter(i => !i.complete || i.naturalWidth === 0),
      text: (document.body.innerText || '').slice(0, 6000)
    };
  })()`);
  return { label, ...metrics };
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const base = {
  version: 2,
  userName: 'テスト調査員',
  onboarded: true,
  discoveredIds: [],
  favorites: [],
  inventory: [],
  buddyId: null,
  bonds: {},
  readMilestones: [],
  lastRewardDate: today(),
  captures: 0,
  petDate: '',
  petCount: 0,
  completedMissionIds: [],
  seenMissionPostscriptIds: [],
  observations: {},
  buddyMemories: {}
};

const mid = {
  ...base,
  discoveredIds: ['001','002','003','004','005'],
  favorites: ['001'],
  inventory: ['item_nut','item_candy','item_screw'],
  buddyId: '001',
  bonds: { '001': 52 },
  readMilestones: [5],
  captures: 8,
  completedMissionIds: ['mission-apple'],
  seenMissionPostscriptIds: ['mission-apple'],
  observations: { '001': ['peeler-freeze'] },
  buddyMemories: { '001': ['first-pet','first-snack','first-expedition','area:water','capture-together','bond:20','bond:50'] }
};

const metrics = [];

// Mobile title
await setViewport(390, 844, true);
await navigate(appUrl);
await evaluate("localStorage.clear()");
await navigate(appUrl);
await screenshot('01-mobile-title.png');
metrics.push(await collectMetrics('mobile-title'));

// Mobile home with current gameplay systems visible
await enterGame(mid);
await screenshot('02-mobile-home.png');
metrics.push(await collectMetrics('mobile-home'));

// Mission hint open
await clickText('追加ヒント');
await sleep(300);
await screenshot('03-mobile-mission-hint.png');
metrics.push(await collectMetrics('mobile-mission-hint'));

// Exploration menu
await clickText('調査に出発');
await sleep(300);
await screenshot('04-mobile-explore-menu.png');
metrics.push(await collectMetrics('mobile-explore-menu'));

// Back to home, then gallery
await enterGame(mid);
await clickText('図鑑');
await sleep(400);
await screenshot('05-mobile-gallery.png');
metrics.push(await collectMetrics('mobile-gallery'));

// Settings
await enterGame(mid);
await evaluate(`(() => { const b = document.querySelector('button[aria-label="設定を開く"]'); if (b) b.click(); })()`);
await sleep(300);
await screenshot('06-mobile-settings.png');
metrics.push(await collectMetrics('mobile-settings'));

// Desktop home
await setViewport(1440, 900, false);
await enterGame(mid);
await screenshot('07-desktop-home.png');
metrics.push(await collectMetrics('desktop-home'));

// Desktop gallery
await clickText('図鑑');
await sleep(400);
await screenshot('08-desktop-gallery.png');
metrics.push(await collectMetrics('desktop-gallery'));

await writeFile(path.join(outDir, 'audit.json'), JSON.stringify(metrics, null, 2));

await cdp.send('Browser.close').catch(() => {});
chromeProc.kill('SIGTERM');
