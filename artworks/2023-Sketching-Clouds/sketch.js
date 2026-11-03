
let lineWaveNoiseScale = 0.02;
let lineWavingLength = 3;

let lineThickness = 6;
let lineDensity = 0.15;

let lineSizeNoiseScale = 0.02;
let dotDensity = 0.8;
let dotSize = [1, 3];

let MONDRIAN;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(255);

  MONDRIAN = color(15, 71, 140);

  colorMode(MULTIPLY);


  // background
  let padding = 0.06 * min(width, height);

  dotDensity = random(0.5, 0.8);
  lineDensity = random(0.06, 0.2);
  lineWaveNoiseScale = random(0.02, 0.12);
  dotSize = [1, 3];
  await NYRect(padding, padding, width - padding * 2, height - padding * 2);

  // draw up frame
  dotSize = [0, 6];
  NYLine(padding, padding, width - padding, padding);

  dotSize = [1, 3];

  // make paths
  let paths = [];
  let pathCount = floor(random(6, 18));
  let pathDist = (height * 0.6) / pathCount;

  for (let i = 0; i < pathCount; i++) {
    let x1 = -padding;
    let y1 = 0.4 * height + i * pathDist;

    let x2 = width + padding;
    let y2 = y1;

    let pathNoise = random(0.001, 0.003);
    let pathHeight = random(0.1, 0.4) * height;
    paths[i] = await getNoisePath(x1, y1, x2, y2, pathNoise, pathHeight);
  }

  let cloudPaths = [];

  // get cloud paths
  for (let i = 0; i < paths.length; i++) {
    let lv1Circles = await getCircleQueue(paths[i], 30, 255);
    let lv1Path = await getCircleWalkPath(lv1Circles, 1);

    let lv2Circles = await getCircleQueue(lv1Path, 10, 60);
    cloudPaths[i] = await getCircleWalkPath(lv2Circles, 1);
  }

  // paint cloud lines
  for (let p = 0; p < cloudPaths.length; p++) {

    let nowPath = cloudPaths[p];

    // fill cloud path
    for (let i = 0; i < nowPath.length; i++) {
      let x1 = nowPath[i].x;
      let y1 = nowPath[i].y;

      let x2 = x1;
      let y2 = height;

      stroke(255);
      line(x1, y1, x2, y2);

      if (i % 100 == 0)
        await sleep(1);
    }

    // draw cloud path
    let shadeNX = random(-1000, 1000);
    let shadeNScale = random(0.003, 0.02);
    let shadeChance = random(0.6, 0.8);

    if (p == 0)
      shadeChance = 1;

    for (let i = 0; i < nowPath.length; i++) {
      let x1 = nowPath[i].x;
      let y1 = nowPath[i].y;

      if (x1 < padding || x1 > width - padding)
        continue;

      shadeNX += shadeNScale;
      let shadeNoise = noise(shadeNX);

      if (shadeNoise < shadeChance) {
        let shadeT = map(shadeNoise, 0, shadeChance, 1, 0);
        let shadeScaler = 1.0;

        if (shadeT < 0.2)
          shadeScaler = shadeT / 0.2;

        noStroke();
        MONDRIAN.setAlpha(255 * random(0.4, 0.8));
        fill(MONDRIAN);
        NoisePoint(x1, y1, shadeScaler);

        if (i % 20 == 0)
          await sleep(1);
      }
    }

    // draw cloud shade
    let cloudPadding = random(60, 200);
    let cloudPaddingNX = random(-1000, 1000);
    let cloudPaddingNScale = 0.03;
    // let cloudLineSpacing = floor(random(6, 18));
    let cloudLineSpacing = floor(1.0 / lineDensity);

    if (p == paths.length - 1)
      break;

    for (let i = 0; i < nowPath.length; i++) {

      let x1 = nowPath[i].x;
      let y1 = nowPath[i].y;

      let x2 = x1;
      let y2 = height - padding;

      if (floor(x1) % cloudLineSpacing != 0)
        continue;

      if (x1 < padding || x1 > width - padding)
        continue;

      cloudPaddingNX += cloudPaddingNScale;
      let paddingNoise = noise(cloudPaddingNX);

      y1 += cloudPadding * paddingNoise;
      // y1 += random(10, 60);

      if (random() < 0.9)
        NYLine(x1, y1, x2, y2);

      if (i % 200)
        await sleep(1);

    }
  }

  // frame
  dotSize = [0, 6];
  NYLine(padding, padding, padding, height - padding);
  NYLine(width - padding, padding, width - padding, height - padding);
  NYLine(padding, height - padding, width - padding, height - padding);

  dotSize = [1, 3];


  // draw last cloud white
  let nowPath = cloudPaths[cloudPaths.length - 1];

  // fill cloud path
  for (let i = 0; i < nowPath.length; i++) {
    let x1 = nowPath[i].x;
    let y1 = nowPath[i].y;

    let x2 = x1;
    let y2 = height;

    stroke(255);
    line(x1, y1, x2, y2);

    if (i % 100 == 0)
      await sleep(1);
  }

  // draw cloud path
  let shadeNX = random(-1000, 1000);
  let shadeNScale = random(0.003, 0.02);
  let shadeChance = random(0.6, 0.8);

  shadeChance = 1;

  for (let i = 0; i < nowPath.length; i++) {
    let x1 = nowPath[i].x;
    let y1 = nowPath[i].y;

    if (x1 < padding || x1 > width - padding)
      continue;

    shadeNX += shadeNScale;
    let shadeNoise = noise(shadeNX);

    if (shadeNoise < shadeChance) {
      let shadeT = map(shadeNoise, 0, shadeChance, 1, 0);
      let shadeScaler = 1.0;

      if (shadeT < 0.2)
        shadeScaler = shadeT / 0.2;

      noStroke();
      MONDRIAN.setAlpha(255 * random(0.4, 0.8));
      fill(MONDRIAN);
      NoisePoint(x1, y1, shadeScaler);

      if (i % 20 == 0)
        await sleep(1);
    }
  }

  // draw cloud shade
  let cloudPadding = random(60, 200);
  let cloudPaddingNX = random(-1000, 1000);
  let cloudPaddingNScale = 0.03;
  // let cloudLineSpacing = floor(random(6, 18));
  let cloudLineSpacing = floor(1.0 / lineDensity);

  for (let i = 0; i < nowPath.length; i++) {

    let x1 = nowPath[i].x;
    let y1 = nowPath[i].y;

    let x2 = x1;
    let y2 = height - padding;

    if (floor(x1) % cloudLineSpacing != 0)
      continue;

    if (x1 < padding || x1 > width - padding)
      continue;

    cloudPaddingNX += cloudPaddingNScale;
    let paddingNoise = noise(cloudPaddingNX);

    y1 += cloudPadding * paddingNoise;
    // y1 += random(10, 60);

    if (random() < 0.9)
      NYLine(x1, y1, x2, y2);

    if (i % 200)
      await sleep(1);

  }
}


function noiseStroke(_x, _y, _maxHeight, _length) {

  let lineCount = _length * lineDensity;

  for (let i = 0; i < lineCount; i++) {
    let t = i / lineCount;

    let xPos = _x + t * _length;
    let yPos = _y;

    let noiseScaler = 1;

    if (t <= 0.1)
      noiseScaler = map(t, 0, 0.1, 0, 1);
    else if (t >= 0.9)
      noiseScaler = map(t, 0.9, 1, 1, 0);

    let noiseValue = noise(xPos * noiseScaleX, yPos * noiseScaleY) * noiseScaler;

    let yAddUp = noiseValue * _maxHeight * 0.7;
    let yAddBot = noiseValue * _maxHeight * 0.3;

    NYLine(xPos, yPos - yAddUp, xPos, yPos + yAddBot);
  }
}

function draw() {

}

async function NYRect(_x, _y, _width, _height) {

  let xLines = _width * lineDensity;
  let xLineSpace = _width / (xLines - 1);

  for (let x = 0; x < xLines; x++) {
    let x1 = _x + x * xLineSpace;
    let y1 = _y;

    let x2 = x1;
    let y2 = _y + _height;

    NYLine(x1, y1, x2, y2);
    await sleep(1);
  }
}

function NYLine(_x1, _y1, _x2, _y2) {
  let dotCount = dist(_x1, _y1, _x2, _y2) * dotDensity;
  let stepDistance = dist(_x1, _y1, _x2, _y2) / dotCount;

  let forwardAngle = getAngle(_x1, _y1, _x2, _y2);

  for (let i = 0; i < dotCount; i++) {
    let t = i / dotCount;
    let xPos = lerp(_x1, _x2, t);
    let yPos = lerp(_y1, _y2, t);

    let sizeNoise = noise(xPos * lineSizeNoiseScale, yPos * lineSizeNoiseScale, 666);
    let waveNoise = noise(xPos * lineWaveNoiseScale, yPos * lineWaveNoiseScale, 999);

    let nowDotSize = lerp(dotSize[0], dotSize[1], sizeNoise);

    // let wavingNoise = noise(xPos * 0.01, yPos * 0.01, 999) * 2 - 1;
    xPos += sin(radians(forwardAngle)) * lineWavingLength * waveNoise;
    yPos -= cos(radians(forwardAngle)) * lineWavingLength * waveNoise;

    strokeWeight(lineThickness);
    MONDRIAN.setAlpha(255 * random(0.3, 0.6));
    fill(MONDRIAN);
    noStroke();

    circle(xPos, yPos, nowDotSize);
  }
}


let pointNoiseX = 0;
let pointNoiseScaleX = 0.06;
let pointNoiseScaleY = 0.003;
let pointNoiseRadius = 3;

function NoisePoint(_x, _y, _scaler = 1) {
  pointNoiseX += pointNoiseScaleX;
  let offsetY = (noise(pointNoiseX) - 0.5) * 2 * pointNoiseRadius;

  let sizeNoise = noise(_x * lineSizeNoiseScale, _y * lineSizeNoiseScale, 666);
  let nowDotSize = lerp(dotSize[0], dotSize[1], sizeNoise);

  circle(_x, _y + offsetY, nowDotSize * _scaler);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}