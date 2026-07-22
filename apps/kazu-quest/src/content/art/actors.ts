/* 正面向き16x16キャラクター。テクスチャ名は "actor-" + キー。 */
import type { PixelArt } from "./format";

export const ACTOR_ART: Record<string, PixelArt> = {
  hero: {
    palette: { k: "#171820", h: "#39281c", H: "#69452a", s: "#e7ad7d", S: "#ffd0a0", b: "#2865aa", B: "#173f75", l: "#5795d2", y: "#f1c644", w: "#f7f1de" },
    rows: [
      ".....kkkkkk.....", "....khHHHHhk....", "...khhHHHHhhk...", "...khkHHHHkhk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSsSSsSSk...", "....kssssssk....",
      "...kkkbbbbkkk...", "..ksklbbbblksk..", "..kskbbbbbbksk..", "...kBbyyyyBbkk..",
      "...kBBbbbbBBk...", "...kkBkkkkBkk...", "....kBk..kBk....", "....kkk..kkk....",
    ],
  },
  mother: {
    palette: { k: "#211916", h: "#75452b", H: "#a76a42", s: "#e8ae82", S: "#ffd0a4", d: "#b84e38", D: "#7f3029", l: "#e37b59", a: "#f0bd55" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHHhhhhHHk...", "...kHkSSSSkHk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kklddddldkk..", "..kskddddddksk..", "..kskddadddksk..", "...kDDddddDDk...",
      "..kDDddddddDDk..", ".kDDDDddddDDDDk.", ".kDDDDDDDDDDDDk.", "..kkkkkkkkkkkk..",
    ],
  },
  king: {
    palette: { k: "#201820", c: "#f2c84b", C: "#a97420", s: "#e9ad7c", S: "#ffd0a0", h: "#70452d", r: "#b43b38", R: "#72282d", l: "#df6550", w: "#f2eee1", y: "#f4dc77" },
    rows: [
      "...kckcckcckck..", "...kccccccccck..", "....kCCCCCCk....", "...khhSSSShhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....ksskkssk....", "....kwwwwwwk....",
      "...kklrrrrlkk...", "..kwkrrrrrrkwk..", ".kwwkrryyrrkwwk.", ".kwkRRrrrrRRkwk.",
      "..kRRrrrrrrRRk..", ".kRRRrrrrrrRRRk.", ".kRRRRRRRRRRRRk.", "..kkkkkkkkkkkk..",
    ],
  },
  villager: {
    palette: { k: "#1c1b17", h: "#4b321f", H: "#755033", s: "#e5aa7b", S: "#ffd0a2", g: "#3f8a48", G: "#286135", l: "#69ae58", b: "#725033" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHhhhhhhHk...", "...kHkSSSSkHk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kkkggggkkk...", "..ksklgggglksk..", "..kskggggggksk..", "...kGgbbbbggGk..",
      "...kGGggggGGk...", "...kkGkkkkGkk...", "....kGk..kGk....", "....kkk..kkk....",
    ],
  },
  scholar: {
    palette: { k: "#1b1920", h: "#d7d5cf", H: "#ffffff", s: "#dfaa82", S: "#f5c9a0", b: "#4c4d72", B: "#30304d", l: "#7379a0", y: "#e6bd43", d: "#9b9b9b" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHhHHHHhHk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....kshhhsk.....", "....khHhHhk.....",
      "...kklbbbblkk...", "..kskbbbybbksk..", "..khkbbbbbbkhk..", "...kBBbbybBBk...",
      "..kBBBbbbbBBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
};
