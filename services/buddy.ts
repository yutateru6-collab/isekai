import { Creature } from '../types';

const AREA_NAMES: Record<string, string> = {
  park: '公園を一緒に調査した',
  garden: '庭・路地裏を一緒に調査した',
  water: '水辺を一緒に調査した',
  house: '家の中を一緒に調査した',
  mystery: '未確認エリアを一緒に調査した'
};

const REACTIONS: Record<string, string[]> = {
  '001': ['甘い香りをふわっと強くした。うれしいらしい。', 'ころんと果実みたいに丸まり、こちらを見上げている。'],
  '002': ['小さな泡をぷくぷく飛ばした。', '足元に水たまりを作って、満足そうにしている。'],
  '003': ['翅をぱたぱたさせて、熟した甘い香りを残した。', '床に降りたが、今日は踏ませる気はないらしい。'],
  '004': ['ゆっくり体をくねらせ、甘い香りを漂わせた。', '近づいてきたが、触ると少しベタつきそうだ。'],
  '019': ['一瞬だけキャベツのふりをしてから、こちらを見た。', '葉っぱの毛を整えて、ごきげんそうにしている。'],
  '022': ['羽が淡く点滅し、Wi-Fiのランプと同じリズムになった。', '冷却ファンみたいな羽音を小さく鳴らした。'],
  '044': ['足元に短い黒鉛の線を引いた。何かを書いたつもりらしい。', 'こちらを見たあと、地面に小さな丸を描いた。']
};

export function buddyReaction(creature: Creature, interactionIndex: number): string {
  const options = REACTIONS[creature.id];
  if (options?.length) return options[interactionIndex % options.length];
  return interactionIndex % 2 === 0
    ? `${creature.name}は少し近くに寄ってきた。`
    : `${creature.name}は安心したようにこちらを見ている。`;
}

export function memoryLabel(memoryId: string): string {
  if (memoryId === 'first-pet') return '初めてふれあった';
  if (memoryId === 'first-snack') return '初めておやつを食べた';
  if (memoryId === 'first-expedition') return '初めて一緒に調査へ出た';
  if (memoryId === 'capture-together') return '一緒に撮影を成功させた';
  if (memoryId.startsWith('area:')) return AREA_NAMES[memoryId.slice(5)] ?? '新しい場所を一緒に調査した';
  if (memoryId.startsWith('bond:')) {
    const value = Number(memoryId.slice(5));
    if (value === 20) return '少しずつ心を開いてくれた';
    if (value === 50) return '息が合うようになってきた';
    if (value === 80) return '強い信頼が生まれた';
    if (value === 100) return '最高の相棒になった';
  }
  return '一緒に過ごした思い出';
}

export function isValidMemoryId(memoryId: string): boolean {
  return ['first-pet', 'first-snack', 'first-expedition', 'capture-together'].includes(memoryId) ||
    /^area:(park|garden|water|house|mystery)$/.test(memoryId) ||
    /^bond:(20|50|80|100)$/.test(memoryId);
}

export function appendMemory(memories: Record<string, string[]>, creatureId: string, memoryId: string): Record<string, string[]> {
  const current = memories[creatureId] ?? [];
  if (current.includes(memoryId)) return memories;
  return { ...memories, [creatureId]: [...current, memoryId] };
}

export function appendBondMemories(memories: Record<string, string[]>, creatureId: string, before: number, after: number) {
  let next = memories;
  for (const threshold of [20, 50, 80, 100]) {
    if (before < threshold && after >= threshold) next = appendMemory(next, creatureId, `bond:${threshold}`);
  }
  return next;
}
