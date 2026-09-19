import { Creature, CreatureType, TimeOfDay, Item, SearchArea, SubAreaSpot } from './types';
import { Trees, Footprints, Waves, Home, MapPin, Sun, Leaf, Cloud, Sparkles } from 'lucide-react';

export const SEARCH_AREAS: SearchArea[] = [
  {
    id: 'park',
    label: '公園エリア',
    type: CreatureType.Park,
    icon: Trees,
    color: 'bg-[#C8E6C9] text-[#2E7D32] border-[#4CAF50]',
    description: '多くの生物が観測される基本エリア。遊具周辺は要チェック。',
    bgImage: '/bg/park.png',
    mapImage: '/bg/park_map_highres.png',
    fpsImage: '/bg/park_fps.png'
  },
  {
    id: 'garden',
    label: '庭・路地裏',
    type: CreatureType.Garden,
    icon: Footprints,
    color: 'bg-[#FFECB3] text-[#F57F17] border-[#FFC107]',
    description: '物陰に潜む小型生物が多い。隙間や影を調査せよ。',
    bgImage: '/bg/garden.png',
    mapImage: '/bg/garden_map_highres.png',
    fpsImage: '/bg/garden_fps.png'
  },
  {
    id: 'water',
    label: '水辺・川',
    type: CreatureType.Water,
    icon: Waves,
    color: 'bg-[#E1F5FE] text-[#0277BD] border-[#29B6F6]',
    description: '水棲生物の生息域。水面の波紋や湿った場所を探れ。',
    bgImage: '/bg/water.png',
    mapImage: '/bg/water_map_highres.png',
    fpsImage: '/bg/water_fps.png'
  },
  {
    id: 'house',
    label: '屋内・家',
    type: CreatureType.House,
    icon: Home,
    color: 'bg-[#E1BEE7] text-[#7B1FA2] border-[#9C27B0]',
    description: '人工物に擬態する生物が生息。家具や家電製品の裏側など。',
    bgImage: '/bg/house.png',
    mapImage: '/bg/house_map_highres.png',
    fpsImage: '/bg/house_fps.png'
  },
  { id: 'mystery', label: '未確認エリア', type: CreatureType.Mystery, icon: Sparkles,
    color: 'bg-purple-100 text-purple-800 border-purple-400', description: '5種類の観測で見つかった世界の隙間。特別な生物の気配がする。',
    bgImage: '/bg/garden.png', mapImage: '/bg/garden_map_highres.png', fpsImage: '/bg/garden_fps.png' },
];

export const AREA_SPOTS: Record<string, SubAreaSpot[]> = {
  park: [
    { id: 'slide', label: '滑り台', x: 25, y: 35, icon: MapPin, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day] },
    { id: 'sandbox', label: '砂場', x: 75, y: 65, icon: MapPin, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Sunset] },
    { id: 'lamp', label: '街灯', x: 85, y: 25, icon: Sun, activeTimes: [TimeOfDay.Sunset, TimeOfDay.Night] },
    { id: 'bush', label: '茂み', x: 20, y: 80, icon: Leaf, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day, TimeOfDay.Night] },
    { id: 'bench_under', label: 'ベンチの下', x: 60, y: 60, icon: Sparkles, activeTimes: [TimeOfDay.Any], type: 'item', itemId: 'item_stone' },
  ],
  garden: [
    { id: 'flowerpot', label: '植木鉢', x: 30, y: 70, icon: Leaf, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day] },
    { id: 'wall', label: 'ブロック塀', x: 50, y: 40, icon: MapPin, activeTimes: [TimeOfDay.Day, TimeOfDay.Sunset] },
    { id: 'shadow', label: '建物の影', x: 80, y: 80, icon: Footprints, activeTimes: [TimeOfDay.Sunset, TimeOfDay.Night] },
    { id: 'acunit', label: '室外機', x: 20, y: 20, icon: MapPin, activeTimes: [TimeOfDay.Night, TimeOfDay.Morning] },
  ],
  water: [
    { id: 'lilypad', label: '蓮の葉', x: 20, y: 70, icon: Leaf, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day] },
    { id: 'waterfall', label: '小さな滝', x: 50, y: 20, icon: Waves, activeTimes: [TimeOfDay.Day, TimeOfDay.Sunset] },
    { id: 'bridge', label: '木の橋', x: 80, y: 40, icon: MapPin, activeTimes: [TimeOfDay.Sunset, TimeOfDay.Night] },
    { id: 'shore', label: '岸辺', x: 30, y: 40, icon: Footprints, activeTimes: [TimeOfDay.Morning, TimeOfDay.Day] },
  ],
  house: [
    { id: 'bookshelf', label: '本棚', x: 20, y: 30, icon: MapPin, activeTimes: [TimeOfDay.Night, TimeOfDay.Any] },
    { id: 'router', label: 'Wi-Fiルーター', x: 80, y: 70, icon: Sun, activeTimes: [TimeOfDay.Any] },
    { id: 'sofa', label: 'ソファー', x: 40, y: 80, icon: MapPin, activeTimes: [TimeOfDay.Day, TimeOfDay.Sunset] },
    { id: 'window', label: '窓際', x: 70, y: 20, icon: Sun, activeTimes: [TimeOfDay.Morning] },
  ],
  mystery: [
    { id: 'fog', label: '濃霧地帯', x: 50, y: 50, icon: Cloud, activeTimes: [TimeOfDay.Morning] },
  ]
};

export const CREATURES: Creature[] = [
  {
    id: '001',
    name: '深紅果実蟲',
    latinName: 'Apple Pillar',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/1.png',
    sketchUrl: '/zukan/1a.png',
    realImageUrl: '/zukan/1.png',
    shortDesc: '写真と実物が違いすぎる詐欺まがいの甘い罠。\n外皮はペクチンとセルロースで構成され、熟れたリンゴの質感を完璧に再現している。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '甘い香りで誘惑する',
    trivia: [
      '【対処法】ピーラーをカチカチ鳴らすと硬直する。',
      '【味】味はリンゴだが食感は生海老。',
      'パイに混ぜるとオーブンが地獄絵図になる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '002',
    name: '泡沫猫',
    latinName: 'Bubble Cat',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Morning, TimeOfDay.Day],
    imageUrl: '/zukan/2.png',
    sketchUrl: '/zukan/2a.png',
    realImageUrl: '/zukan/2.png',
    shortDesc: '靴下を濡らすだけの、儚きかわいさ。\n表面張力だけで猫の形を保っている液状生命体。「にゃーん」と鳴くたびにシャボン玉が出る。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '湿気を好む',
    trivia: [
      '【対処法】珪藻土マットで水分を奪う。',
      '【味】洗剤の味がする。',
      '換気扇を回すと吸い込まれて消滅する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '003',
    name: '完熟翼蝶',
    latinName: 'Banana Butterfly',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Morning],
    imageUrl: '/zukan/3.png',
    sketchUrl: '/zukan/3a.png',
    realImageUrl: '/zukan/3.png',
    shortDesc: '朝、急いでいる時に限って踏むやつ。\n翅がバナナの果肉と皮で構成されている。熟すと床に落ちて踏まれるのを待つ。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '踏まれると滑る',
    trivia: [
      '【対処法】30%OFFシールを貼るとショックで飛べなくなる。',
      '【味】非常に甘く栄養価が高い。',
      'ミキサーを見せると失神する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '004',
    name: '甘味粘液蛇',
    latinName: 'Strawberry Jam Viper',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/4.png',
    sketchUrl: '/zukan/4a.png',
    realImageUrl: '/zukan/4.png',
    shortDesc: '【警告】糖度高すぎ！糖尿病待ったなしの殺人シロップ。\n全身が高粘度の苺シロップと果肉で構成されている。',
    dangerLevel: 4,
    syncRate: 0,
    role: 'sage_psycho',
    perk: 'アリを誘引する',
    trivia: [
      '【対処法】無糖ヨーグルトを投げつける。',
      '【味】美味だがベタベタが取れない。',
      '熱い紅茶を用意すると逃げていく。'
    ],
    evolutionLevel: 1
  },
  {
    id: '005',
    name: '緑色野菜鳥',
    latinName: 'Broccodri',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Morning, TimeOfDay.Day],
    imageUrl: '/zukan/5.png',
    sketchUrl: '/zukan/5a.png',
    realImageUrl: '/zukan/5.png',
    shortDesc: 'SDGsが生んだ、自走するビタミン源。\n羽毛の代わりにブロッコリー状の組織が生えているエコな鳥。光合成が可能。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: 'マヨネーズが大嫌い',
    trivia: [
      '【対処法】ゴマドレッシングを見せる。',
      '【味】茹でると美味しいが断末魔が聞こえる。',
      '水だけで生きられる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '006',
    name: '黄色巡回蜂',
    latinName: 'School Bus Hornet',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/6.png',
    sketchUrl: '/zukan/6a.png',
    realImageUrl: '/zukan/6.png',
    shortDesc: '働き方改革を無視した過重労働の末路。\n体内が空洞で幼虫を運ぶ。渋滞に巻き込まれると排気ガスの毒針を撒く。',
    dangerLevel: 4,
    syncRate: 0,
    role: 'none',
    perk: '時間厳守',
    trivia: [
      '【対処法】「運休のお知らせ」を見せる。',
      '【味】食べられない。維持費が高い。',
      'Suica残高不足のエラー音でフリーズする。'
    ],
    evolutionLevel: 1
  },
  {
    id: '007',
    name: '極彩透明鹿',
    latinName: 'Crystal Dear',
    type: CreatureType.Mystery,
    activeTime: [TimeOfDay.Morning],
    imageUrl: '/zukan/7.png',
    sketchUrl: '/zukan/7a.png',
    realImageUrl: '/zukan/7.png',
    shortDesc: '己が透けていることに気づかぬ、哀れなナルシスト。\n全身がクリスタルガラス質。水たまりで自分の姿を見つめている。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '美意識が高い',
    trivia: [
      '【対処法】指紋をベタベタつける。',
      '【味】食べると体が透明になり存在感が消える。',
      '背景ボケ機能で輪郭がぼやけるのを嫌う。'
    ],
    evolutionLevel: 1
  },
  {
    id: '008',
    name: '発明甲虫',
    latinName: 'Edison Beetle',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/8.png',
    sketchUrl: '/zukan/8a.png',
    realImageUrl: '/zukan/8.png',
    shortDesc: '省エネ基準を満たしていない旧式モデル。\n背中のフィラメントを発光させて求愛する。興奮すると高温になる。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '発熱する',
    trivia: [
      '【対処法】LED電球を見せつける。',
      '【味】口の中でガラスが割れるので不可。',
      '停電時に役立つが鍋つかみ必須。'
    ],
    evolutionLevel: 1
  },
  {
    id: '009',
    name: '祭礼麺犬',
    latinName: 'Yakisoba Dog',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Sunset],
    imageUrl: '/zukan/9.png',
    sketchUrl: '/zukan/9a.png',
    realImageUrl: '/zukan/9.png',
    shortDesc: '屋台の匂いにつられて帰ってきたご先祖様。\nソース焼きそばへの執着が具現化。嬉しいと青のりを撒き散らす。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: 'マヨネーズ探知',
    trivia: [
      '【対処法】割り箸を割る音を聞かせる。',
      '【味】食べられるが愛犬家と保健所が黙ってない。',
      '雨の日は麺が伸びて巨大化する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '010',
    name: '積乱雲猫',
    latinName: 'Nimbus Cat',
    type: CreatureType.Mystery,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/10.png',
    sketchUrl: '/zukan/10a.png',
    realImageUrl: '/zukan/10.png',
    shortDesc: '気圧の変化で頭痛を引き起こすモフモフ。\n水蒸気が凝縮した猫。機嫌が悪いと雷を鳴らす。洗濯物を湿らせるのが趣味。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '空中浮遊',
    trivia: [
      '【対処法】除湿機のスイッチを入れる。',
      '【味】口の中がパチパチする。',
      '降水確率0%を聞くと消える。'
    ],
    evolutionLevel: 1
  },
  {
    id: '011',
    name: '炭火蜥蜴',
    latinName: 'Charcoal Lizard',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/11.png',
    sketchUrl: '/zukan/11a.png',
    realImageUrl: '/zukan/11.png',
    shortDesc: 'バーベキューの後に、いつまでも消えないあいつ。\n炭化した皮膚に種火を宿す。冬場は暖かい。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '消えにくい火',
    trivia: [
      '【対処法】火消し壺に入れて酸素遮断。',
      '【味】炭の味。',
      'ポケットに入れると最強のカイロ（服は焦げる）。'
    ],
    evolutionLevel: 1
  },
  {
    id: '012',
    name: '魔空飛絨毯',
    latinName: 'Carpet Manta',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Any],
    imageUrl: '/zukan/12.png',
    sketchUrl: '/zukan/12a.png',
    realImageUrl: '/zukan/12.png',
    shortDesc: 'ハウスダストを撒き散らす飛行物体。\nエイ型の織物生物。乗った人間を空へ誘拐する。掃除機が快感らしい。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '空中輸送',
    trivia: [
      '【対処法】コロコロ（粘着クリーナー）を見せる。',
      '【味】ホコリの味。',
      'ルンバとは敵対関係。'
    ],
    evolutionLevel: 1
  },
  {
    id: '013',
    name: '折鶴鷺',
    latinName: 'Origami Heron',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/13.png',
    sketchUrl: '/zukan/13a.png',
    realImageUrl: '/zukan/13.png',
    shortDesc: '水に濡れると即死する、紙一重の命。\n幾何学的に折り畳まれた鳥。背中に願い事を書かれると重くて飛べない。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '願いを運ぶ（物理）',
    trivia: [
      '【対処法】ハサミをカシャカシャ鳴らす。',
      '【味】パルプの味。',
      '霧吹きを見せるだけで逃げる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '014',
    name: '水銀甲虫',
    latinName: 'Metal Scarab',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/14.png',
    sketchUrl: '/zukan/14a.png',
    realImageUrl: '/zukan/14.png',
    shortDesc: '相場が高騰しているレアメタル（※猛毒）。\n常温で液状化する金属の虫。電子機器に入り込みショートさせる。',
    dangerLevel: 5,
    syncRate: 0,
    role: 'none',
    perk: '通電',
    trivia: [
      '【対処法】強力磁石で吸い寄せる。',
      '【味】食べたら死ぬ。',
      '冷凍庫に入れると固まって機能停止する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '015',
    name: '溶岩山椒魚',
    latinName: 'Magma Salamander',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/15.png',
    sketchUrl: '/zukan/15a.png',
    realImageUrl: '/zukan/15.png',
    shortDesc: '設定温度が高すぎる給湯器のなれの果て。\n高熱を発する両生類。冷めると固まる。温泉を一瞬で沸騰させる。',
    dangerLevel: 4,
    syncRate: 0,
    role: 'none',
    perk: '湯沸かし',
    trivia: [
      '【対処法】水風呂へ誘導してヒートショックさせる。',
      '【味】激辛。食べると火を吹く。',
      '冬場の抱き枕にすると布団が燃える。'
    ],
    evolutionLevel: 1
  },
  {
    id: '016',
    name: '回転翼蜻蛉',
    latinName: 'Heli Dragonfly',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/16.png',
    sketchUrl: '/zukan/16a.png',
    realImageUrl: '/zukan/16.png',
    shortDesc: '航空法違反の覗き魔。\nローター状の羽を持つ機械化トンボ。カメラの複眼でプライバシーを侵害する。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '盗撮',
    trivia: [
      '【対処法】国土交通省への通報をちらつかせる。',
      '【味】金属とオイルの味。',
      'Wi-Fi接続でドローン化するが充電切れで暴走する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '017',
    name: '展示用ワレモノ孔雀',
    latinName: 'Stained Glass Peacock',
    type: CreatureType.Mystery,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/17.png',
    sketchUrl: '/zukan/17a.png',
    realImageUrl: '/zukan/17.png',
    shortDesc: '賠償額が怖くて誰も近づけない美術館の主。\nガラス片と鉛フレームの鳥。「割れたくない」一心で慎重に歩く。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '美術的価値',
    trivia: [
      '【対処法】梱包材（プチプチ）を見せる。',
      '【味】口の中が血だらけになる。',
      'オペラ歌手のような高音で歌うと共鳴して割れる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '018',
    name: 'プロテイン過剰摂取蜂',
    latinName: 'Muscle Hornet',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/18.png',
    sketchUrl: '/zukan/18a.png',
    realImageUrl: '/zukan/18.png',
    shortDesc: 'ジムの会費を払わずに居座る迷惑会員。\n筋トレ優先の蜂。主な攻撃はラリアット。「フンッ！フンッ！」という息遣い。',
    dangerLevel: 4,
    syncRate: 0,
    role: 'sage_force',
    perk: '筋肉増強',
    trivia: [
      '【対処法】カーボローディング（炭水化物）を勧める。',
      '【味】ゴムのように硬い。粉末にすると最強プロテイン。',
      'ポージングに夢中な隙に逃げる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '019',
    name: '葉菜齧歯',
    latinName: 'Cabbage Mouse',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/19.png',
    sketchUrl: '/zukan/19a.png',
    realImageUrl: '/zukan/19.png',
    shortDesc: '農家の敵であり、サラダバーのアイドル。\n体毛が葉野菜に変異。驚くと丸まってキャベツに擬態する。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '擬態',
    trivia: [
      '【対処法】青虫を放つとパニックになる。',
      '【味】シャキシャキして美味しい。',
      '千切りにすると無限に増える。'
    ],
    evolutionLevel: 1
  },
  {
    id: '020',
    name: '歯列芋虫',
    latinName: 'Dental Worm',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/20.png',
    sketchUrl: '/zukan/20a.png',
    realImageUrl: '/zukan/20.png',
    shortDesc: '歯医者が夢に見るうなされる光景。\n人間の臼歯でできたワーム。カチカチと歯ぎしり音がする。キシリトール嫌い。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '歯垢除去',
    trivia: [
      '【対処法】フロスを持って追い回す。',
      '【味】硬すぎて歯が欠ける。',
      '高周波ドリル音で縮こまる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '021',
    name: '汚泥鼠鳥',
    latinName: 'Trash Griffon',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/21.png',
    sketchUrl: '/zukan/21a.png',
    realImageUrl: '/zukan/21.png',
    shortDesc: '分別ルールを無視した不法投棄の王。\nドブネズミと鳩の混種。収集日を理解する知能犯。翼は油でベトベト。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: 'ゴミ収集',
    trivia: [
      '【対処法】「燃えないゴミの日」の札を見せる。',
      '【味】食べるな危険（ウイルスと重金属）。',
      '清掃業者の作業服が天敵。'
    ],
    evolutionLevel: 1
  },
  {
    id: '022',
    name: '光トンボ',
    latinName: 'Light Bunbun',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/22.png',
    sketchUrl: '/zukan/22a.png',
    realImageUrl: '/zukan/22.png',
    shortDesc: 'ゲーミングPCが生んだ電子の虫。\nネオン管と配線のトンボ。Wi-Fiに乗って移動。羽音は冷却ファン。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '発光',
    trivia: [
      '【対処法】ブレーカーを落とす。',
      '【味】食べると感電する。',
      '大量ダウンロードで処理落ちさせる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '023',
    name: '挟虫',
    latinName: 'Pancake Scarab',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Morning],
    imageUrl: '/zukan/23.png',
    sketchUrl: '/zukan/23a.png',
    realImageUrl: '/zukan/23.png',
    shortDesc: '朝食バイキングから逃げ出した高カロリー。\n甲羅がパンケーキの甲虫。甘い香りのトラップ。バターで保湿。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '高糖質',
    trivia: [
      '【対処法】カロリー計算アプリを見せつける。',
      '【味】最高だが罪悪感がすごい。',
      'シロップをかければ無限パンケーキ機関。'
    ],
    evolutionLevel: 1
  },
  {
    id: '024',
    name: '吹奏甲虫',
    latinName: 'Trumpet Beetle',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/24.png',
    sketchUrl: '/zukan/24a.png',
    realImageUrl: '/zukan/24.png',
    shortDesc: '早朝練習で近所迷惑な金管楽器。\n角がトランペットのカブトムシ。大音量で求愛。手入れしないと錆びる。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '騒音',
    trivia: [
      '【対処法】ミュート（弱音器）を角に詰める。',
      '【味】真鍮の味（金属中毒注意）。',
      '指揮棒を振ると整列してしまう。'
    ],
    evolutionLevel: 1
  },
  {
    id: '025',
    name: '枯葉鎌切',
    latinName: 'Autumn Mantis',
    type: CreatureType.Garden,
    activeTime: [TimeOfDay.Day, TimeOfDay.Sunset],
    imageUrl: '/zukan/25.png',
    sketchUrl: '/zukan/25a.png',
    realImageUrl: '/zukan/25.png',
    shortDesc: 'センチメンタルな季節の殺し屋。\n枯れ葉と葡萄のカマキリ。擬態しすぎて焚き火に放り込まれる事故多発。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '哀愁',
    trivia: [
      '【対処法】ブロワー（送風機）で吹き飛ばす。',
      '【味】渋くて食べられない。',
      '本に挟むと心臓麻痺ドッキリグッズになる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '026',
    name: '発光ゲーミング海老',
    latinName: 'RGB Shrimp',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/26.png',
    sketchUrl: '/zukan/26a.png',
    realImageUrl: '/zukan/26.png',
    shortDesc: '1680万色に光る無駄なハイスペック。\n虹色に発光制御されたエビ。FPS値が高いほど高速遊泳。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: 'ゲーミング発光',
    trivia: [
      '【対処法】低スペグラボを見せて絶望させる。',
      '【味】胃の中で光り続けるのでレントゲン注意。',
      '水槽に入れると部屋がラブホ化する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '027',
    name: '氷室宿借',
    latinName: 'Crystal Hermit',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/27.png',
    sketchUrl: '/zukan/27a.png',
    realImageUrl: '/zukan/27.png',
    shortDesc: '冷凍庫の奥で忘れ去られた保冷剤。\n氷の結晶を背負うヤドカリ。周囲を凍らせて家を拡張する。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '冷却',
    trivia: [
      '【対処法】ドライヤーの温風を当てる。',
      '【味】刺身は美味だが知覚過敏には致死的。',
      '塩を撒くと溶ける。'
    ],
    evolutionLevel: 1
  },
  {
    id: '028',
    name: '鉛筆削り蝸牛',
    latinName: 'Stationery Snail',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/28.png',
    sketchUrl: '/zukan/28a.png',
    realImageUrl: '/zukan/28.png',
    shortDesc: 'アナログ絵描きの怨念が生んだ文具。\n殻が鉛筆削りのカタツムリ。這った跡に削りカスを残す。よく芯を折る。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '鉛筆削り',
    trivia: [
      '【対処法】iPadを見せて削る場所がないと絶望させる。',
      '【味】木の味がする。',
      'コスパが悪い（削りすぎる）。'
    ],
    evolutionLevel: 1
  },
  {
    id: '029',
    name: '果実海月',
    latinName: 'Fruit Jellyfish',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/29.png',
    sketchUrl: '/zukan/29a.png',
    realImageUrl: '/zukan/29.png',
    shortDesc: 'プールに浮かぶ巨大なデザート。\n体内に新鮮フルーツを取り込んだゼリー質の海月。触手は水飴。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '糖分補給',
    trivia: [
      '【対処法】巨大スプーンを構える。',
      '【味】極上のフルーツゼリー。',
      '生食は窒息リスクあり（触手が張り付く）。'
    ],
    evolutionLevel: 1
  },
  {
    id: '030',
    name: '彩色蟹',
    latinName: 'Color Pencil Crab',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Day],
    imageUrl: '/zukan/30.png',
    sketchUrl: '/zukan/30a.png',
    realImageUrl: '/zukan/30.png',
    shortDesc: 'お絵かきセットから脱走した凶器。\n脚が色鉛筆のカニ。地面にカラフルな線を描く。芯を尖らせて攻撃。',
    dangerLevel: 2,
    syncRate: 0,
    role: 'none',
    perk: '描画',
    trivia: [
      '【対処法】消しゴムを持って追いかける。',
      '【味】芯の味がして不味い。',
      'カッターナイフを見せると硬直する。'
    ],
    evolutionLevel: 1
  },
  {
    id: '031',
    name: '絶対零度企鵝',
    latinName: 'Freezing Penguin',
    type: CreatureType.Water,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/31.png',
    sketchUrl: '/zukan/31a.png',
    realImageUrl: '/zukan/31.png',
    shortDesc: '解凍に失敗して霜だらけになった冷凍食品。\n氷柱と冷気で覆われたペンギン。常に「寒い」と文句を言っている。',
    dangerLevel: 3,
    syncRate: 0,
    role: 'none',
    perk: '冷凍',
    trivia: [
      '【対処法】電子レンジのドアを開けて待つ。',
      '【味】硬すぎて歯が立たない。',
      '抱き枕にすると凍死リスクあり。'
    ],
    evolutionLevel: 1
  },
  {
    id: '032',
    name: '雪原毛虫',
    latinName: 'Snow Caterpillar',
    type: CreatureType.Park,
    activeTime: [TimeOfDay.Morning],
    imageUrl: '/zukan/32.png',
    sketchUrl: '/zukan/32a.png',
    realImageUrl: '/zukan/32.png',
    shortDesc: 'スキー場のコースに落ちている巨大な雪玉（動く）。\n雪の結晶が集まった毛虫。春になると溶けてただの水になる。',
    dangerLevel: 1,
    syncRate: 0,
    role: 'none',
    perk: '除雪妨害',
    trivia: [
      '【対処法】融雪剤を撒く。',
      '【味】シロップをかければかき氷（動く）。',
      'スコップを見せるだけで震え上がる。'
    ],
    evolutionLevel: 1
  },
  {
    id: '044',
    name: '硬度黒鉛獣',
    latinName: 'Graphite Beast',
    type: CreatureType.House,
    activeTime: [TimeOfDay.Night],
    imageUrl: '/zukan/44.png',
    sketchUrl: '/zukan/44a.png',
    realImageUrl: '/zukan/44.png',
    shortDesc: '全てを記述し直す者。かつて世界の理を記録していた鉛筆の成れの果て。\n四肢を使って歩行し、通った跡には黒い炭素の軌跡が残る。',
    dangerLevel: 4,
    syncRate: 0,
    role: 'sage_logic',
    perk: '論理演算',
    trivia: [
      '【対処法】消しゴムのカスを集めて道を作る。',
      '【味】純粋なカーボンの味。',
      '計算式を書くと解かずにはいられない。'
    ],
    evolutionLevel: 1
  },

];

export const APP_NAME = "パラレル生物図鑑";

export const ITEMS: Item[] = [
  {
    id: 'item_stone',
    name: '不思議な石',
    icon: '🪨',
    description: '異世界の波動を感じる石。持っていると少しだけ運気が上がる気がする。',
    type: 'material',
    effectValue: 5
  },
  {
    id: 'item_nut',
    name: 'パラレルナッツ',
    icon: '🌰',
    description: '食べると少しだけ浮くらしい木の実。味は未知数。',
    type: 'food',
    effectValue: 10
  },
  {
    id: 'item_screw',
    name: '謎のネジ',
    icon: '🔩',
    description: 'どこのパーツだろう？ 異世界の機械の一部かもしれない。',
    type: 'material',
    effectValue: 5
  },
  {
    id: 'item_shadow',
    name: '逃げ去る影の残滓',
    icon: '💨',
    description: '捕まえられなかった悔しさの結晶。手で触れるとスルリと抜けていく。',
    type: 'lore',
    effectValue: 2
  },
  {
    id: 'item_candy',
    name: '異世界のキャンディ',
    icon: '🍬',
    description: '舐めると風景が少し歪んで見える。相棒が大好きな味。',
    type: 'food',
    effectValue: 20
  },
  {
    id: 'item_memo',
    name: 'おじさんのメモ',
    icon: '📝',
    description: '博士が落とした走り書き。「今日は夕方が狙い目」と書いてある。',
    type: 'lore',
    effectValue: 5
  }
];