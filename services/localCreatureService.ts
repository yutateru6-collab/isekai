import { Creature } from "../types";

export const decipherCreatureLore = async (creature: Creature): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 700));

  return `【解析完了】\n\n対象：${creature.name} (${creature.latinName})\n分類：${creature.type}\n\n観測データに基づく追加レポート：\n${creature.shortDesc}\n\nこの生物は非常に特殊な生態系の一部であり、継続的な観測が推奨されます。現時点でのデータは以上です。`;
};

export const chatWithDoctor = async (
  creature: Creature,
  userQuestion: string,
  userName: string = "調査員"
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const responses = [
    `ふむ、${userName}君。${creature.name}について気になるとは、いい着眼点だ。`,
    `その質問は非常に興味深い！${creature.type}の生物にはよく見られる特徴に関連しているかもしれないな。`,
    `ワシの長年の研究でも、${creature.name}にはまだまだ謎が多いのだよ。一緒に観察していこうじゃないか。`,
    `なるほど……「${userQuestion}」か。今ある観測記録だけでは断定できないが、調べる価値はありそうだ。`,
    `手元の観測記録を見る限り、${creature.name}にはまだ未確認の特徴がありそうだ。`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};
