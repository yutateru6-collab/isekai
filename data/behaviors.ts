export interface BehaviorObservation {
  id: string;
  label: string;
  description: string;
}

export const BEHAVIOR_VARIANTS: Record<string, BehaviorObservation[]> = {
  '001': [
    { id: 'peeler-freeze', label: '硬直中', description: 'ピーラーのような金属音に反応し、果実そっくりの姿のまま固まっている。' },
    { id: 'scenting', label: '誘香中', description: '熟したリンゴのような香りを強く放ち、周囲の生物を引き寄せようとしている。' }
  ],
  '019': [
    { id: 'camouflage', label: '擬態中', description: '体を丸めてキャベツそっくりになり、葉の隙間で動きを止めている。' },
    { id: 'nibbling', label: '食事中', description: '葉を小刻みにかじりながら、減った体毛を新しい葉で補っている。' }
  ],
  '022': [
    { id: 'low-power', label: '省電力中', description: '発光を弱め、冷却ファンのような羽音も小さくして休んでいる。' },
    { id: 'wifi-dash', label: '高速移動中', description: 'Wi-Fiの通信に合わせるように瞬間的な加速を繰り返している。' }
  ]
};

export function nextBehaviorVariant(creatureId: string, observedIds: string[]): BehaviorObservation | null {
  return BEHAVIOR_VARIANTS[creatureId]?.find(v => !observedIds.includes(v.id)) ?? null;
}

export function validBehaviorIds(creatureId: string): Set<string> {
  return new Set((BEHAVIOR_VARIANTS[creatureId] ?? []).map(v => v.id));
}

export function behaviorById(creatureId: string, id: string): BehaviorObservation | null {
  return BEHAVIOR_VARIANTS[creatureId]?.find(v => v.id === id) ?? null;
}
