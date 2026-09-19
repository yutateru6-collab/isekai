"""Real user journeys against the production build; never calls React internals.
Run a Vite preview on 4173, then: python scripts/ui-check.py
Fixtures provide existing saves; captures and missions are completed using actual UI input.
"""
import asyncio
import copy
import json
import os
import re
import shutil
import time
from datetime import date
from pathlib import Path
from playwright.async_api import async_playwright, expect
from PIL import Image

OUT = Path('ui-evidence')
OUT.mkdir(exist_ok=True)
URL = os.environ.get('AUDIT_URL', 'http://127.0.0.1:4173')
KEY = 'parallel-zukan-save-v2'
BASE = dict(version=2, userName='観測テスト', onboarded=True, discoveredIds=[], favorites=[], inventory=[], buddyId=None, bonds={}, readMilestones=[], lastRewardDate=date.today().isoformat(), captures=0, petDate='', petCount=0, completedMissionIds=[], seenMissionPostscriptIds=[], observations={}, buddyMemories={})
MID = {**BASE, 'discoveredIds': ['001','002','003','004','005'], 'favorites': ['001'], 'buddyId': '001', 'bonds': {'001':48}, 'captures':7, 'readMilestones':[5], 'completedMissionIds':['mission-apple'], 'seenMissionPostscriptIds':['mission-apple'], 'buddyMemories':{'001':['first-pet','first-expedition','area:water','bond:20']}}
REPORT = {'checks': [], 'screenshots': [], 'errors': []}

def passed(name, **details):
    REPORT['checks'].append({'name': name, 'passed': True, **details})
    print('PASS:', name, json.dumps(details, ensure_ascii=False), flush=True)

async def stored(page):
    return await page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', KEY)

async def reset(page, progress=None, legacy=False):
    await page.goto(URL, wait_until='domcontentloaded')
    await page.evaluate('localStorage.clear()')
    if progress is not None:
        await page.evaluate('([key, p]) => localStorage.setItem(key, JSON.stringify(p))', ['parallel-zukan-save-v1' if legacy else KEY, progress])
    await page.reload(wait_until='domcontentloaded')
    if progress is not None:
        await page.get_by_role('button', name='つづきから', exact=True).click()
        await expect(page.locator('.mission-note')).to_be_visible()

async def screen(page, name, state_selector):
    await expect(page.locator(state_selector)).to_be_visible()
    await page.evaluate('document.fonts.ready')
    await page.wait_for_function('''() => [...document.images].filter(i => {
      const r = i.getBoundingClientRect(); return r.width && r.height && r.bottom > 0 && r.top < innerHeight;
    }).every(i => i.complete)''', timeout=15000)
    await page.screenshot(path=str(OUT / (name + '.png')), animations='disabled')
    metrics = await page.evaluate('''() => {
      const visible = e => { const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0; };
      const buttons=[...document.querySelectorAll('.zukan-app button,.zukan-app summary')].filter(visible).map(b=>{const r=b.getBoundingClientRect();return {text:(b.getAttribute('aria-label')||b.innerText).slice(0,65),w:r.width,h:r.height,x:r.x,y:r.y};});
      return {viewport:[innerWidth,innerHeight], overflow:document.documentElement.scrollWidth>innerWidth+1, buttons, brokenImages:[...document.images].filter(visible).filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)};
    }''')
    REPORT['screenshots'].append({'name':name, 'expectedState':state_selector, **metrics})
    assert not metrics['overflow'], f'Horizontal overflow: {name}'
    assert not metrics['brokenImages'], f'Broken visible images: {name}'
    small = [b for b in metrics['buttons'] if b['w'] < 43.8 or b['h'] < 43.8]
    assert not small, f'Small touch targets in {name}: {small}'
    # Compact originals for inline visual review; full-resolution PNGs remain in the artifact.
    img = Image.open(OUT / (name + '.png')).convert('RGB')
    if img.width > 1000:
        img.thumbnail((1000, 1000))
    img.save(OUT / (name + '-review.jpg'), quality=62, optimize=True)
    print('SCREEN:', name, metrics['viewport'], flush=True)

async def open_field(page, area, observation_time):
    await page.locator('.mission-depart').click()
    await page.locator('.time-selector').get_by_role('button', name=observation_time, exact=True).click()
    await page.locator('.area-choice').filter(has_text=area).click()
    await expect(page.locator('.field-scene')).to_be_visible()

async def choose(page, clue):
    await page.locator('.field-trace').filter(has_text=clue).click()
    await expect(page.locator('.field-inspect')).to_be_enabled()

async def capture(page, slow=True):
    await page.locator('.field-inspect').click()
    region = page.get_by_role('region', name='パラレル・カム撮影')
    await expect(region).to_be_visible()
    await page.get_by_role('button', name='ゆっくり撮影（時間制限なし）' if slow else '撮影スタート（20秒）', exact=True).click()
    await region.focus()
    until = time.monotonic() + 40
    while time.monotonic() < until:
        if await page.locator('.result-notebook').is_visible():
            return
        hittable = await page.locator('[data-note-y]').evaluate_all('(ns) => ns.some(n => Math.abs(Number(n.dataset.noteY)-74)<4)')
        if hittable:
            await page.keyboard.press('Space')
        await page.wait_for_timeout(60)
    raise AssertionError('Capture did not complete through real keyboard input')

async def run():
    chrome = os.environ.get('CHROME_PATH') or shutil.which('google-chrome') or shutil.which('chromium')
    if not chrome:
        raise RuntimeError('A real Chrome/Chromium executable is required')
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=chrome, headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
        context = await browser.new_context(viewport={'width':390,'height':844}, locale='ja-JP', timezone_id='Asia/Tokyo', reduced_motion='reduce')
        page = await context.new_page()
        page.on('pageerror', lambda e: REPORT['errors'].append(str(e)))
        try:
            await reset(page)
            await screen(page, '00-mobile-title', 'button')
            for width, height in [(320,700),(390,844),(1440,900)]:
                await page.set_viewport_size({'width':width,'height':height})
                await reset(page, copy.deepcopy(MID))
                box = await page.locator('.mission-depart').bounding_box()
                assert box and box['y']+box['height'] < height-85, f'Departure CTA below first view at {width}'
                accessible = await page.locator('.mission-depart').evaluate('(el) => { const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); }')
                assert accessible, 'CTA covered by another layer'
                passed(f'home CTA visible and clickable {width}x{height}', y=round(box['y']), height=round(box['height']))
                await screen(page, f'01-home-{width}', '.mission-note')
            await page.set_viewport_size({'width':390,'height':844})
            await reset(page, copy.deepcopy(MID))
            await page.get_by_role('button', name='追加ヒントを見る', exact=True).click()
            await screen(page, '02-mobile-hint', '#mission-extra-hint')
            await page.locator('.mission-depart').click()
            await screen(page, '03-mobile-planner', '.area-grid')
            await page.locator('.time-selector').get_by_role('button', name='早朝', exact=True).click()
            await page.locator('.area-choice').filter(has_text='水辺・川').click()
            await choose(page, '泡の混じった足あと')
            await screen(page, '04-mobile-field', '.field-detail-label')
            await page.set_viewport_size({'width':1440,'height':900})
            await screen(page, '05-desktop-field', '.field-detail-label')
            await page.set_viewport_size({'width':390,'height':844})
            await page.get_by_role('button', name='調査を終えてホームへ', exact=True).click()
            await page.get_by_role('button', name='図鑑', exact=True).click()
            await screen(page, '06-mobile-gallery', '.catalog-grid')
            await page.get_by_role('button', name='未確認生物 No.006のスケッチを見る', exact=True).click()
            await expect(page.locator('#creature-title')).to_have_text('未確認生物 No.006')
            assert '黄色巡回蜂' not in await page.locator('body').inner_text()
            await screen(page, '07-unknown-sketch', '#creature-title')
            await page.get_by_role('button', name='生物の詳細を閉じる', exact=True).click()
            await page.get_by_role('button', name='♥ お気に入り', exact=True).click()
            await expect(page.locator('.creature-tile')).to_have_count(1)
            passed('favorites filter uses actual saved favorites; locked identity is hidden')
            await screen(page, '08-favorites', '.catalog-grid')
            await page.get_by_role('button', name='設定を開く', exact=True).click()
            await expect(page.locator('.settings-guide').first).not_to_have_attribute('open', '')
            await screen(page, '09-settings', '#settings-title')
            await page.locator('input[type=file]').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{broken'})
            await expect(page.get_by_role('alert')).to_be_visible()
            passed('malformed save import reports an error and does not replace progress')
            assert (await stored(page))['discoveredIds'] == MID['discoveredIds']
            await page.get_by_role('button', name='設定を閉じる', exact=True).click()

            await reset(page, copy.deepcopy(MID))
            for _ in range(5):
                await page.get_by_role('button', name='深紅果実蟲とふれあう', exact=True).click()
            p = await stored(page)
            assert p['petCount'] == 3 and p['bonds']['001'] == 54
            passed('five real pet clicks only award three daily bond increases')

            # Six missions completed end to end using only the displayed traces and camera.
            await reset(page, copy.deepcopy(BASE))
            missions = [
                ('mission-apple','庭・路地裏','日中','歩くリンゴの香り'),
                ('mission-bubble','水辺・川','早朝','泡の混じった足あと'),
                ('mission-banana','庭・路地裏','早朝','黄色い羽ばたき'),
                ('mission-jam','屋内・家','日中','甘くベタつく軌跡'),
                ('mission-heli','公園エリア','日中','小さな回転音'),
                ('mission-light','屋内・家','深夜','通信に揺れる光'),
            ]
            for index, (mission_id, area, observation_time, clue) in enumerate(missions):
                await open_field(page, area, observation_time)
                if mission_id == 'mission-light':
                    await choose(page, '金属の落とし物')
                    await page.locator('.field-inspect').click()
                    await expect(page.locator('.result-notebook')).to_be_visible()
                    assert (await stored(page))['inventory'].count('item_screw') == 1
                    await page.get_by_role('button', name='ほかの痕跡を調べる', exact=True).click()
                    await expect(page.locator('.field-trace').filter(has_text='金属の落とし物')).to_be_disabled()
                    passed('required item is obtainable by its clue and cannot be collected twice in one field')
                    await page.get_by_role('button', name='エリアを選び直す', exact=True).click()
                    await page.locator('.area-choice').filter(has_text=area).click()
                await choose(page, clue)
                if index == 5:
                    await screen(page, '10-night-field', '.field-detail-label')
                await capture(page, slow=index != 0)
                p = await stored(page)
                assert mission_id in p['completedMissionIds'] and len(p['completedMissionIds']) == index+1
                passed('mission through real field/camera input: '+mission_id)
                if index == 0:
                    await screen(page, '11-first-discovery', '.result-mission')
                await page.get_by_role('button', name='ホームへ戻る', exact=True).click()
                await expect(page.locator('.mission-note-letter')).to_be_visible()
                await page.get_by_role('button', name=re.compile('追伸を読んで')).click()
            await expect(page.locator('.mission-note h2')).to_contain_text('すべての依頼')
            assert len((await stored(page))['discoveredIds']) == 6
            await page.get_by_role('button', name='記録', exact=True).click()
            assert await page.locator('.archive-letter').count() == 6
            await page.locator('.archive-letter summary').first.click()
            await screen(page, '12-mission-archive', '.archive-letter[open]')

            # One known species, active apple investigation: repeat observation is reached via UI.
            repeat = {**copy.deepcopy(BASE), 'discoveredIds':['001'], 'captures':1}
            await reset(page, repeat)
            await open_field(page, '庭・路地裏', '日中')
            await choose(page, '歩くリンゴの香り')
            await capture(page)
            assert (await stored(page))['observations']['001'] == ['peeler-freeze']
            assert (await stored(page))['discoveredIds'] == ['001']
            await page.get_by_role('button', name='図鑑で観測記録を見る', exact=True).click()
            await expect(page.locator('.detail-ecology')).to_contain_text('硬直中')
            await screen(page, '13-ecology-record', '.detail-ecology')
            await page.reload(wait_until='domcontentloaded')
            await page.get_by_role('button', name='つづきから', exact=True).click()
            assert (await stored(page))['observations']['001'] == ['peeler-freeze']
            passed('repeat ecology is visible in the guide and persists after reload without changing species count')

            legacy = {k:copy.deepcopy(v) for k,v in MID.items() if k in ['version','userName','onboarded','discoveredIds','favorites','inventory','buddyId','bonds','readMilestones','lastRewardDate','captures']}
            legacy['version'] = 1
            await reset(page, legacy, legacy=True)
            assert (await stored(page))['version'] == 2
            assert (await stored(page))['bonds']['001'] == 48
            original = await page.evaluate('JSON.parse(localStorage.getItem("parallel-zukan-save-v1"))')
            assert original == legacy
            passed('legacy v1 save auto-migrates to v2 and retains the original copy')
            assert not REPORT['errors'], REPORT['errors']
            passed('no uncaught browser errors')
            REPORT['success'] = True
        except Exception as exc:
            REPORT['success'] = False
            REPORT['failure'] = str(exc)
            await page.screenshot(path=str(OUT/'failure.png'), animations='disabled')
            (OUT/'failure-dom.txt').write_text(await page.locator('body').inner_text(), encoding='utf-8')
            raise
        finally:
            REPORT['browser'] = browser.version
            REPORT['commit'] = os.environ.get('GITHUB_SHA', 'local')
            (OUT/'audit.json').write_text(json.dumps(REPORT, ensure_ascii=False, indent=2), encoding='utf-8')
            await browser.close()

asyncio.run(run())
