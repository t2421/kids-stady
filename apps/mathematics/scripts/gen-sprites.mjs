import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import pngjs from "pngjs";

const { PNG } = pngjs;
const DOT_SCALE = 2;

const COLORS = {
  transparent: [0, 0, 0, 0],
  "hull-light": "#eef2fb",
  hull: "#c3cfe6",
  "hull-shade": "#8fa3c8",
  "hull-dark": "#4a5e85",
  blue: "#2e6fd8",
  cyan: "#35c4ff",
  red: "#e8483f",
  "red-dark": "#9c2b25",
  orange: "#ff9f43",
  yellow: "#ffd93d",
  green: "#3ec46d",
  purple: "#8447ff",
  "purple-dark": "#5a2fb8",
  brown: "#b08968",
  "brown-dark": "#7a5c42",
  outline: "#1a2340",
  "yellow-glow": [255, 217, 61, 72],
  "cyan-glow": [53, 196, 255, 72],
  "green-fill": [62, 196, 109, 38],
};

const PALETTE = {
  ".": COLORS.transparent,
  o: COLORS.outline,
  h: COLORS["hull-light"],
  H: COLORS.hull,
  s: COLORS["hull-shade"],
  d: COLORS["hull-dark"],
  B: COLORS.blue,
  C: COLORS.cyan,
  R: COLORS.red,
  r: COLORS["red-dark"],
  O: COLORS.orange,
  Y: COLORS.yellow,
  G: COLORS.green,
  P: COLORS.purple,
  p: COLORS["purple-dark"],
  b: COLORS.brown,
  q: COLORS["brown-dark"],
  A: COLORS["yellow-glow"],
  c: COLORS["cyan-glow"],
  g: COLORS["green-fill"],
};

const SPRITE_SPECS = {
  ship: [39, 22],
  "ship-flame": [10, 5],
  "enemy-ufo": [18, 11],
  "enemy-rock": [16, 16],
  "enemy-bird": [20, 14],
  "enemy-red": [18, 14],
  boss: [70, 62],
  capsule: [20, 20],
  drone: [22, 22],
  bullet: [7, 2],
  missile: [9, 5],
  laser: [21, 4],
  ebullet: [5, 5],
  "option-orb": [10, 10],
  "shield-bubble": [34, 34],
};

const ASCII_ART = {
  "ship": [
    ".......................................",
    ".....oo................................",
    "......RRo..............................",
    "......ooRRoo...................ooooooo.",
    ".......oosRRRo.........oooooooohhhhhho.",
    ".......oooooooooooooBo.ohhhhhhhhhhhhho.",
    ".......ohhhhhhhhBBBBBCBBBhhhhhhhhooooo.",
    ".ooooooohhhhhhhBBBCCCCCCCBoooooooo.....",
    ".odddddohhhhhhBBBBBBBCBBBBBddddddd.....",
    ".CCCdddohhHHHHHBBBBBBBBBBBddddddddddoo.",
    ".CCCdddohhhRRRRRRRRRRRRRRRRRdddddddddd.",
    ".CCCdddossssssssssssBssssssssddddddddd.",
    ".CCCdddossHHHHHHHHHHHHHHHHHddddddddd...",
    ".odddddossHHHoHHHHHHHHHoooooooo........",
    ".ooooooodssssssssssssssosssssooooo.....",
    ".......ooooooooooooooooosssssssssooooo.",
    ".......ooosssrroo......ossssssssssssso.",
    ".......oosrrro.........oooooooosssssso.",
    "......oorroo...................ooooooo.",
    "......rro..............................",
    ".....oo................................",
    "......................................."
  ],
  "ship-flame": [
    "........oo",
    "....oooohO",
    "ooOOYYYYYY",
    "...ooOOOrO",
    "......oooo"
  ],
  "enemy-ufo": [
    ".........p........",
    "......pppPppp.....",
    "....opPhhhhPPpo...",
    "...ooPPPPPPPPPoo..",
    "..ooppPPPPPPPppoo.",
    ".oopppppppppppppoo",
    "..hPPPPPPPPPPPPdP.",
    ".ooPPYPPPYPPPYPPoo",
    "..oopOpppOpppOpoo.",
    "....ooooooooooo...",
    ".........o........"
  ],
  "enemy-rock": [
    "................",
    ".....oooooo.....",
    "....ohhhHhoo....",
    "...ohhhhdhqbo...",
    "..ohhqhhhqqqbo..",
    ".ohhobqhhhqhhbo.",
    "ohhqqqqqbbbbbbo.",
    ".ohhqqqbbbbbbHo.",
    ".ohbbqbbbbbqbdo.",
    ".obHbbbbbboqqbo.",
    ".obdbbbbbqqqqqo.",
    ".obqqbbbbqqqqoo.",
    ".oobqqqqqqqqoo..",
    "...obqqHqqqoo...",
    "....ooodoooo....",
    "................"
  ],
  "enemy-bird": [
    ".............oo.....",
    "............oGo.....",
    "..........oGGGo.....",
    ".....ooooGGGGo......",
    "....oGGGGGGGGooo....",
    "..oGGhoGGGhhhhhhoo..",
    "YYYYYGGGGGGHGGGHGoo.",
    "YYYYYBBBBBBBBBBBBBoo",
    "...BBBBBBoooooooBoo.",
    "....odBBBBBBBBBooo..",
    ".....ooooBBBBooo....",
    "..........oBBB......",
    "............ooo.....",
    "...................."
  ],
  "enemy-red": [
    "..................",
    "..............ooo.",
    "..........oohhoo..",
    "......oooohhhRRo..",
    ".....ooPhhhhhRo...",
    "...oohPPPPRRRRo...",
    "..oRPPPPPPPdddOdd.",
    "orrrrPPPPPrdddYdd.",
    "..oorrrProrrrro...",
    "....ooorrrrrrroo..",
    "......oooorrrrro..",
    "..........oorrooo.",
    "..............ooo.",
    ".................."
  ],
  "boss": [
    "......................................................................",
    "......................................................................",
    "..........................................o...........................",
    ".............................o...........oo...........................",
    "............................ooo.........ooho..........................",
    "...........................ooho.........ooYo..........................",
    ".................o.........ooYoo.......ooYYoo........o................",
    ".................oo.......ooYYYoo.....ooYYYYo.......oo................",
    ".................ooo.....oooYYYYo.....oYYYYYoo.....ooo................",
    ".................ooYo....ooYYYYYoo...ooYYYYYoo....oYoo................",
    ".................ooYYo.hooYYYYYYYoo.ooYYYYYYYoo.hoYYoo................",
    ".................ooYYYooooYYYYYYYYoooYYYYYYYYoo.oYYYoo................",
    ".................ooYOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOoo................",
    ".................ooYYYYYYYYYYYYYYYYYYYYYYYYYYYoYYYYYoo................",
    ".................ooooooooooooooooooooooooooooooooooooo................",
    "..........................oooooooooPooooooooo.........................",
    "......................ooooPPPPPPPPPPPPPPPPPPPoooo.....................",
    "...................ohhhhhhhhhhhhhhhhhhhhhhhhhhhhhhoo..................",
    ".................oPhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhoo................",
    "...............oophhhhhhhhhhphhhhhhhhhhhhphhhhhhhhhhphoo..............",
    ".............oohhphhhhhhhhhhphhhhhhhhhhhhphhhhhhhhhhphhhoo............",
    "............ohhhhphhhhhhhhhhphhhhhhhhhhhhphhhhhhhhhhphhhhPo...........",
    "..........ohhhhhhphhhhhhhhhhphhhhhhhhhhhhphhhhhhhhhhphhhhhhoo.........",
    ".........hhhhhhhhphhhhhhhhhhpppppppppppppphhhhhhhhhhphhhhhhhho........",
    ".......hhhhhhhhhhphhhhohhhhhhhhhhhhhhhhhhhhhhhhhohhhphhhhhhhhho.......",
    "......PPPhhhhhhhhpoooohoooohhhhhhhhhhhhhhhhhoooohoooohhhhhhhPPPo......",
    "......PPPPPhhhhhoohhhhhhhhhoohhhhhhhhhhhhhoohhhhhhhhhoohhhPPPPPPo.....",
    ".....oPPPPPPPhhoohhhhhhhhhhhoohhhhhhhhhhhoohhhhhhhhhhhooPPPPPPPPPo....",
    ".....oPPPHdPPPoohhhhhhhhhhhhhooPPPPPPPPPoohhhhhhhhhhhhhooPPPHdPPPo....",
    "....oPPPPdPPPPohhhhhhhhhdhhhhhoPPPPPPPPPohhhhhhhhhdhhhhhoPPPdPPPPPo...",
    "..ooPPPPPPPPPoohhhhhhhdddddhhhooPPPPPPPoohhhhhhhdddddhhhooPPPPPPPPPoo.",
    "..ooPPPPPPPPPoohhhhhhdhdddddhhooPPPPPPPoohhhhhhdhdddddhhooPPPPPPPPPoo.",
    "..ooPPPPPPPPPohhhhhhhddhddddhhhoPPPPPPPohhhhhhhddhddddhhhoPPPPPPPPPoo.",
    "..ooPPPPPPPPooohhhhhhdddddddhhoooPPPPPooohhhhhhdddddddhhoooPPPPPPPPoo.",
    "..ooPppppppppoohhhhhdddddddddhooPPPPPPPoohhhhhdddddddddhoopppppppppoo.",
    "..ooPPPPPPPPPoohhhhhhdddddddhhooPPPPPPPoohhhhhhdddddddhhooPPPPPPPPPoo.",
    "..oPPPPPPPPPPooohhhhhdddddddhoooPPPPPPPooohhhhhdddddddhoooPPPPPPPPPPo.",
    "..ooPPPPPPPPPPooohhhhdddddddoooPPPPPPPPPooohhhhdddddddoooPPPPPPPPPPoo.",
    ".oooPPPPPPPPPPoooohhhhdddddooooPPPPPPPPPoooohhhhdddddooooPPPPPPPPPPooo",
    "..ooPPPPHdPPPPPooooooohodoooooPPPPPPPPPPPooooooohodoooooPPPPPHdPPPPoo.",
    "..ooPPPPdPPPPPPPoooooooooooooPPPPPPPPPPPPPoooooooooooooPPPPPPdPPPPPoo.",
    "..ooPPPPPPPPPPPPPPoooooooooPPPPPPPPPPPPPPPPPoooooooooPPPPPPPPPPPPPPoo.",
    "..opooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.",
    "..oopppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppoo.",
    "..ooppppppppppppppppppppppoooooooooooooooooopppppppppppppppppppppppoo.",
    "...ooppppppppppppppppppppoooooooooooooooooooooppppppppppppppppppppoo..",
    "...oopppppppppppppppppppoooodpddddddddddpdooooopppppppppppppppppppoo..",
    "....opppppppoppppppppppooodddpddddddddddpdddoooopppppppppoppppppppo...",
    ".....oppBBBBBBBBBBpppooodddddpddddddddddpddddooooppppBBBBBBBBBBppo....",
    ".....oppppppopppppppppoooddddpddddddddddpdddddoooppppppppopppppppo....",
    "......opppppoppppppppppooodddpddddddddddpddddooopppppppppoppppppo.....",
    ".......pppppoppppppppppooooddpddddddddddpdddoooopppppppppopppppp......",
    ".......pppppopppppppppppooooopoooooooooopooooooppppppppppopppppp......",
    "........ppppopppppppppppoooooooooooooooooooooooppppppppppoppppp.......",
    "........ppppoppppppppppppooooooooooooooooooooopppppppppppoppppp.......",
    "........pppppppppppppppppppppppppppppppppppppppppppppppppppppp........",
    "..........ppppppppHdpppppppppppppppppppppppppppppppHdpppppppp.........",
    "............ppppppdppppppppppppppppppppppppppppppppdppppppp...........",
    "..............ppppppppppppppppppppppppppppppppppppppppppp.............",
    "................ppppppppppppppppppppppppppppppppppppppp...............",
    "......................ooooooooooooooooooooooooooo.....................",
    "..........................ooooooooooooooooooo........................."
  ],
  "capsule": [
    "....................",
    ".........oo.........",
    "......AAooooAAA.....",
    ".....AAoohYooAAA....",
    "....AAoohhhYooAAA...",
    "...AAoohhhYYYooAAA..",
    "..AAoohhhYYYYYooAAA.",
    "..AoohhhYYYYYYYooAA.",
    "..oohhhhYYYYYYYYooA.",
    ".oohhhhYYYYYYYYYYoo.",
    "ooOOOOYYYYYYYYOOOooA",
    "..ooOOOYYYYYYOOrooA.",
    "..AooOOOYYYYOOrooAA.",
    "..AAooOOOYYOOrooAAA.",
    "..AAAooOOOOOrooAAAA.",
    "...AAAooOOOOooAAAA..",
    "....AAAooOOooAAAA...",
    ".....AAAooooAAAA....",
    "......AAAooAAAA.....",
    "..........A........."
  ],
  "drone": [
    "......................",
    "...........c..........",
    ".......ccccCcccc......",
    ".....ccoCCCCCCCocc....",
    "....ccCCCCCCCCCCCcc...",
    "...ccCCCCCCCCCCCCCcc..",
    "...cohhhhhhhhhhhhCoc..",
    "..coCCCCChCChhhCCCCoc.",
    "..coCCCChCCCCChCCCCoc.",
    "..coCHCCCCCCCChCCHCoc.",
    "..cCCCCCCCCCCChCCCCCc.",
    ".cooBBBBBBBBhhBBBBCooc",
    "..coBBBBBBBhBBBBBBCoc.",
    "..coBdBBBBBhBBBBBdCoc.",
    "..cBBBBBBBBhBBBBBBooc.",
    "..coddddddddddddddooc.",
    "...coBBBBBhhhBBBBBoc..",
    "...ccBBBBBhhhBBBBocc..",
    "....ccBBBBBBooooocc...",
    ".....ccooooooooocc....",
    ".......ccccocccc......",
    "...........c.........."
  ],
  "bullet": [
    "oYYYYhh",
    "oOOOOHo"
  ],
  "missile": [
    ".........",
    "oohhhoYYh",
    "oOOOOOYYY",
    "oorrroYYY",
    ".....oooo"
  ],
  "laser": [
    "ooooooooooooooooooooo",
    "oChhhhhhhhhhhhhhhhhhh",
    "oCCCCCCCCCCCCCCCCCCCC",
    "ooooooooooooooooooooo"
  ],
  "ebullet": [
    "..o..",
    ".hRR.",
    "oRRro",
    ".RrR.",
    "..o.."
  ],
  "option-orb": [
    ".....A....",
    "..AAAYAAA.",
    ".AAhhhYYAA",
    ".AohhhYYoA",
    ".AYhhhYYYA",
    "AoOOOOOOoo",
    ".AoOOOOOoA",
    ".AoOOOOOoA",
    ".AAoorooAA",
    "..AAAoAAA."
  ],
  "shield-bubble": [
    "..................................",
    "............oooooooooo............",
    "..........oooooooooooooo..........",
    "........ooooohhhhhGGGooooo........",
    ".......oooohhhhggggGGGGoooo.......",
    "......ooohhhggggggggggGGGooo......",
    ".....ooohhggggggggggggggGGooo.....",
    "....ooohhggggggggggggggggGGooo....",
    "...ooohhggggggggggggggggggGGooo...",
    "...oohhggggggggggggggggggggGGoo...",
    "..ooohggggggggggggggggggggggGooo..",
    "..oohhggggggggggggggggggggggGGoo..",
    ".ooohggggggggggggggggggggggggGooo.",
    ".oohhggggggggggggggggggggggggGGoo.",
    ".oohhggggggggggggggggggggggggGGoo.",
    ".ooGggggggggggggggggggggggggggGoo.",
    ".ooGggggggggggggggggggggggggggGoo.",
    ".ooGggggggggggggggggggggggggggGoo.",
    ".ooGggggggggggggggggggggggggggGoo.",
    ".ooGGggggggggggggggggggggggggddoo.",
    ".ooGGggggggggggggggggggggggggddoo.",
    ".oooGggggggggggggggggggggggggdooo.",
    "..ooGGggggggggggggggggggggggddoo..",
    "..oooGggggggggggggggggggggggdooo..",
    "...ooGGggggggggggggggggggggddoo...",
    "...oooGGggggggggggggggggggddooo...",
    "....oooGGggggggggggggggggddooo....",
    ".....oooGGggggggggggggggddooo.....",
    "......oooGGGggggggggggdddooo......",
    ".......ooooGGGGggggddddoooo.......",
    "........oooooGGGGddddooooo........",
    "..........oooooooooooooo..........",
    "............oooooooooo............",
    ".................................."
  ]
};

function toRgba(color) {
  if (Array.isArray(color)) return color;

  const channels = color.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16));
  assert(channels?.length === 3, `Invalid palette color: ${color}`);
  return [...channels, 255];
}

function assertAsciiDimensions(key, rows, dotWidth, dotHeight) {
  assert.equal(rows.length, dotHeight, `${key}: expected ${dotHeight} rows, got ${rows.length}`);

  for (const [rowIndex, row] of rows.entries()) {
    assert.equal(
      [...row].length,
      dotWidth,
      `${key}: row ${rowIndex + 1} must be ${dotWidth} dots, got ${[...row].length}`,
    );

    for (const paletteKey of row) {
      assert(paletteKey in PALETTE, `${key}: unknown palette key "${paletteKey}" on row ${rowIndex + 1}`);
    }
  }
}

function renderSprite(key, rows, dotWidth, dotHeight) {
  assertAsciiDimensions(key, rows, dotWidth, dotHeight);

  const pixelWidth = dotWidth * DOT_SCALE;
  const pixelHeight = dotHeight * DOT_SCALE;
  const png = new PNG({ width: pixelWidth, height: pixelHeight, colorType: 6 });

  for (const [dotY, row] of rows.entries()) {
    for (const [dotX, paletteKey] of [...row].entries()) {
      const rgba = toRgba(PALETTE[paletteKey]);

      for (let scaleY = 0; scaleY < DOT_SCALE; scaleY += 1) {
        for (let scaleX = 0; scaleX < DOT_SCALE; scaleX += 1) {
          const pixelX = dotX * DOT_SCALE + scaleX;
          const pixelY = dotY * DOT_SCALE + scaleY;
          const offset = (pixelY * pixelWidth + pixelX) * 4;
          png.data.set(rgba, offset);
        }
      }
    }
  }

  return PNG.sync.write(png, { colorType: 6 });
}

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = resolve(appRoot, "public/assets/sprites");
mkdirSync(outputDirectory, { recursive: true });

assert.deepEqual(
  Object.keys(ASCII_ART).sort(),
  Object.keys(SPRITE_SPECS).sort(),
  "ASCII art keys must exactly match sprite specification keys",
);

const dimensions = [];
for (const [key, [dotWidth, dotHeight]] of Object.entries(SPRITE_SPECS)) {
  const encodedPng = renderSprite(key, ASCII_ART[key], dotWidth, dotHeight);
  const outputPath = resolve(outputDirectory, `${key}.png`);
  writeFileSync(outputPath, encodedPng);

  const decodedPng = PNG.sync.read(encodedPng);
  assert.equal(decodedPng.width, dotWidth * DOT_SCALE, `${key}: PNG width mismatch`);
  assert.equal(decodedPng.height, dotHeight * DOT_SCALE, `${key}: PNG height mismatch`);

  dimensions.push({
    key,
    dots: `${dotWidth}x${dotHeight}`,
    png: `${decodedPng.width}x${decodedPng.height}`,
  });
}

console.log(`Generated ${dimensions.length} sprites in ${outputDirectory}`);
console.table(dimensions);

