import { TimeOfDay } from '../types';

export interface InvestigationMission {
  id: string;
  title: string;
  targetCreatureId: string;
  areaId: string;
  time: TimeOfDay;
  requiredItemId?: string;
  clues: string[];
  extraHint: string;
  postscript: string;
}

export const MISSIONS: InvestigationMission[] = [
  {
    id: 'mission-apple',
    title: 'リンゴの匂いが歩いている',
    targetCreatureId: '001',
    areaId: 'garden',
    time: TimeOfDay.Day,
    clues: [
      '叔父さんの観測器に、甘い果実みたいな匂いが映った。',
      '水辺ではない。人の家の中でもないらしい。',
      '暗くなると反応がほとんど消える。'
    ],
    extraHint: '「庭・路地裏」を「日中」に調べてみてくれ。赤い果実そっくりの生物を探せ。',
    postscript: 'やっぱり深紅果実蟲だった！ 写真の反応がこっちにも届いた。匂いだけでリンゴ買いに行きたくなったわ。'
  },
  {
    id: 'mission-bubble',
    title: '濡れた足あとを追え',
    targetCreatureId: '002',
    areaId: 'water',
    time: TimeOfDay.Morning,
    clues: [
      '朝の観測ログに、小さな水滴の足あとが続いている。',
      '鳴き声らしき反応の直後に、丸い泡がいくつも出た。',
      '日が高くなる前のほうが反応が強い。'
    ],
    extraHint: '「水辺・川」を「早朝」に調査。水でできた猫みたいな姿が目印だ。',
    postscript: '泡沫猫、無事に確認！ こっちに戻った瞬間に床がびしょびしょ。かわいいけど雑巾が足りん。'
  },
  {
    id: 'mission-banana',
    title: '朝の黄色い落とし物',
    targetCreatureId: '003',
    areaId: 'garden',
    time: TimeOfDay.Morning,
    clues: [
      '黄色いものが飛んだ、という記録が朝だけ残っている。',
      '地面に落ちると、急に生物反応が分かりにくくなる。',
      '人通りの少ない庭や路地の近くで目撃された。'
    ],
    extraHint: '「庭・路地裏」を「早朝」に調べよう。バナナのような翅を探してくれ。',
    postscript: '完熟翼蝶だった！ こっちでも床に落ちてて、危うく叔父さんが滑るところだった。いや、ちょっと滑った。'
  },
  {
    id: 'mission-jam',
    title: '甘すぎる室内反応',
    targetCreatureId: '004',
    areaId: 'house',
    time: TimeOfDay.Day,
    clues: [
      '室内から糖分みたいな強い反応が出ている。',
      '動いた跡が、妙にベタベタしているらしい。',
      '夜より昼の観測値がはっきりしている。'
    ],
    extraHint: '「屋内・家」を「日中」に調査。苺シロップのような蛇を探そう。',
    postscript: '甘味粘液蛇を確認！ こっちに戻ってきたあと机が全部ベタベタ。研究より掃除のほうが大変だぞこれ。'
  },
  {
    id: 'mission-heli',
    title: '公園の小さな回転音',
    targetCreatureId: '016',
    areaId: 'park',
    time: TimeOfDay.Day,
    clues: [
      '公園から、虫の羽音にしては規則正しすぎる回転音がする。',
      '日中の観測データだけ、空中に細かいノイズが残る。',
      '近づくと、こちらを先に見つけられている気配がある。'
    ],
    extraHint: '「公園エリア」を「日中」に調査。ローターのような羽を持つ生物が対象だ。',
    postscript: '回転翼蜻蛉、記録成功！ こっちに戻った直後から叔父さんの顔を撮ってる。肖像権って異世界でもある？'
  },
  {
    id: 'mission-light',
    title: '深夜のWi-Fiノイズ',
    targetCreatureId: '022',
    areaId: 'house',
    time: TimeOfDay.Night,
    requiredItemId: 'item_screw',
    clues: [
      '深夜だけWi-Fiの波形に、生き物みたいな揺れが混ざる。',
      '金属の小物を置いた観測地点では反応が長く残った。',
      '外ではなく、家の中から出ている信号だ。'
    ],
    extraHint: '「謎のネジ」をバッグに入れた状態で、「屋内・家」を「深夜」に調査。光るトンボを探そう。',
    postscript: '光トンボを確認！ 謎のネジにちゃんと反応したな。今こっちのルーター周りが虹色に光ってる。ちょっと格好いい。'
  }
];

export const MISSION_IDS = new Set(MISSIONS.map(m => m.id));

export function activeMission(completedIds: string[]): InvestigationMission | null {
  return MISSIONS.find(m => !completedIds.includes(m.id)) ?? null;
}

export function missionConditionsMet(
  mission: InvestigationMission,
  creatureId: string,
  areaId: string,
  time: TimeOfDay,
  inventoryIds: string[]
): boolean {
  return creatureId === mission.targetCreatureId &&
    areaId === mission.areaId &&
    time === mission.time &&
    (!mission.requiredItemId || inventoryIds.includes(mission.requiredItemId));
}

export function missionBoostAvailable(
  mission: InvestigationMission | null,
  areaId: string,
  time: TimeOfDay,
  inventoryIds: string[]
): boolean {
  if (!mission) return false;
  return mission.areaId === areaId &&
    mission.time === time &&
    (!mission.requiredItemId || inventoryIds.includes(mission.requiredItemId));
}
