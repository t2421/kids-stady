/*
 * 港町ミナトス — 第2章の拠点。宿・道具屋・まなびや・ほこら (4軒) と港。
 * 僧侶タスクが ほこらの前で まっていて、話すと なかまに なる。
 */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../../chapter1/legends";

export const CH2_MINATOS: MapDef = {
  id: "ch2-minatos",
  name: "みなとまち ミナトス",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T........=.........T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WIDW..=..WSDW...T",
    "T...=....=....=....T",
    "T...======....=....T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WoDW..=..WoDW...T",
    "T...=....=....=....T",
    "T...==========.....T",
    "T~~~~~~~~=~~~~~~~~~T",
    "T~~~~~~~~=~~~~~~~~~T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "harbor-master",
      x: 11,
      y: 5,
      art: "king",
      movement: "static",
      dialog: [
        {
          if: { flag: "c2.orb2", op: "set" },
          pages: [
            "おお! 「すうしょう・弐」を とりもどしたのか!",
            "これで しまの かずも 船の じこくひょうも もとどおりじゃ。",
            "ありがとう ゆうしゃよ! つぎの すうしょうは 砂漠の くにに…",
            "それは また こんどの おはなし。ゆっくり やすんでいきなされ。",
          ],
          then: [{ type: "setFlag", flag: "c2.clear" }],
        },
        {
          if: { flag: "c2.metTasuku", op: "set" },
          pages: [
            "塔には 九九の とびらが いくつも あるらしい。",
            "まなびやで ククダマを おぼえてから いくのじゃぞ。",
          ],
        },
        {
          pages: [
            "わしは ミナトスの みなとの 長じゃ。",
            "九九の塔に インクの魔女ブロッタが すみつき、「すうしょう・弐」を うばいおった…",
            "ほこらの タスクが おぬしを まっておったぞ。こえを かけてやってくれ。",
          ],
          then: [{ type: "setFlag", flag: "c2.metMaster" }],
        },
      ],
    },
    {
      id: "tasuku-join",
      x: 13,
      y: 10,
      art: "tasuku",
      movement: "static",
      hideIf: { flag: "c2.metTasuku", op: "set" },
      dialog: [
        {
          pages: [
            "きみが カズールの ゆうしゃだね! ぼくは タスク。ほこらの みならい僧侶だよ。",
            "「たしざんの いのり」で みんなを かいふくできるんだ。",
            "魔女ブロッタを たおしに いくんでしょ? ぼくも つれてって!",
            "タスクが なかまに くわわった!",
          ],
          then: [
            { type: "joinParty", memberId: "tasuku", level: 6 },
            { type: "setFlag", flag: "c2.metTasuku" },
          ],
        },
      ],
    },
    {
      id: "sailor",
      x: 5,
      y: 11,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["船なら 西の 港から でているよ。しおかぜが きもちいいなあ。"],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-inn",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-minatos-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-minatos-shop", spawn: "start" },
      ],
    },
    {
      id: "to-manabiya",
      x: 5,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-minatos-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-minatos-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-world",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-world", spawn: "from-minatos" }],
    },
  ],
  spawns: {
    entrance: { x: 9, y: 1, facing: "down" },
    "from-inn": { x: 5, y: 5, facing: "down" },
    "from-shop": { x: 14, y: 5, facing: "down" },
    "from-manabiya": { x: 5, y: 10, facing: "down" },
    "from-shrine": { x: 14, y: 10, facing: "down" },
  },
};
