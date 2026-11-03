// Weekly Creative Coding Challenge Topic 'Refraction'

// The refraction calculation reference:
// https://www.omnicalculator.com/physics/angle-of-refraction
//
// But since I usually use 0 ~ 360 to represent line rotation,
// which is different from the usual x = y formula
// so it took me a while to program the refraction calculation method.
//
// I think there might be a better way to do the shape division,
// but just let it be for now. 😛
let _mainHue = 0;

async function setup() {

  // traits

  let RECT_DIVIDE_TYPE = int(random(0, 2)); // 0: rect array, 1: subdivition
  MAX_DEPTH = int(random(3, 10)); // for subdivition

  let BEAM_SPAWN_TYPE = int(random(0, 2)); // 0: top and bottom, 1: left and right

  let MIN_RECT_RATIO = random(0.3, 0.8);

  let beam_spread_random = random();
  if (beam_spread_random < 0.25) {
    BEAM_SPREAD_RANGE = random(0.06, 0.6);
    BEAM_THICKNESS = 0.2;
    BEAM_DOT_DENSITY = random(1.0, 6.0);
  }
  else if (beam_spread_random < 0.75) {
    BEAM_SPREAD_RANGE = random(2, 6);
    BEAM_THICKNESS = 0.8;
    BEAM_DOT_DENSITY = random(4, 8);
  }
  else {
    BEAM_SPREAD_RANGE = random(20, 60);
    BEAM_THICKNESS = 1.0;
    // BEAM_DOT_DENSITY = random(12, 24);
    BEAM_DOT_DENSITY = random(10, 30);
  }



  // traits

  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(30);

  colorMode(HSB);

  _mainHue = random(0, 360);

  let padding = min(width, height) * 0.06;

  let refractors = [];

  if (RECT_DIVIDE_TYPE == 0) {

    let xCount = int(random(6, 24));
    let yCount = int(random(6, 24));

    let rectType = int(random(0, 4));
    if (rectType == 0) {
      xCount = int(random(3, 12));
      yCount = int(random(3, 12));
    }
    else if (rectType == 1) {
      xCount = int(random(8, 36));
      yCount = int(random(8, 36));
    }
    else if (rectType == 2) {
      xCount = int(random(3, 6));
      yCount = int(random(12, 36));
    }
    else {
      xCount = int(random(12, 36));
      yCount = int(random(3, 6));
    }

    let rectWidth = (width - 2 * padding) / xCount;
    let rectHeight = (height - 2 * padding) / yCount;

    for (let x = 0; x < xCount; x++) {
      for (let y = 0; y < yCount; y++) {
        let nowX = padding + x * rectWidth;
        let nowY = padding + y * rectHeight;
        let rectCenterX = nowX + rectWidth * 0.5;
        let rectCenterY = nowY + rectHeight * 0.5;

        // let nowRectWidth = random(0.2, 0.8) * rectWidth;
        // let nowRectHeight = random(0.2, 0.8) * rectHeight;
        let sizeNoise = noise(nowX * 0.01, nowY * 0.01, 1234);

        let nowRectWidth = lerp(0.3, 1.0, sizeNoise) * rectWidth;
        let nowRectHeight = lerp(0.3, 1.0, sizeNoise) * rectHeight;

        let sizeXDiff = rectWidth - nowRectWidth;
        let sizeYDiff = rectHeight - nowRectHeight;

        let offsetXNoise = noise(nowX * 0.3, nowY * 0.3, 4321);
        let offsetYNoise = noise(nowX * 0.3, nowY * 0.3, 5678);

        let offsetCenterX = rectCenterX + lerp(-0.5, 0.5, offsetXNoise) * sizeXDiff;
        let offsetCenterY = rectCenterY + lerp(-0.5, 0.5, offsetYNoise) * sizeYDiff;

        // let rectRotation = random(0, 360);
        let rotationNoise = noise(nowX * 0.01, nowY * 0.01);
        let rectRotation = lerp(-40, 40, rotationNoise);
        // let rectRotation = noise(nowX * 0.001, nowY * 0.001) * 720;

        let newRect = new RefractionObj(offsetCenterX, offsetCenterY, nowRectWidth, nowRectHeight, rectRotation);
        refractors.push(newRect);
      }
    }
  }
  else {
    let rects = subdivideRect(padding, padding, width - 2 * padding, height - 2 * padding, 0);
    // for(let i=0; i< rects.length; i++) {
    //   rects[i].draw();
    // }

    for (let i = 0; i < rects.length; i++) {
      let nowRect = rects[i];
      let nowCenterX = nowRect.x + nowRect.w * 0.5;
      let nowCenterY = nowRect.y + nowRect.h * 0.5;

      let nowRectWidth = nowRect.w * random(MIN_RECT_RATIO, 1.0);
      let nowRectHeight = nowRect.h * random(MIN_RECT_RATIO, 1.0);

      let xSizeDiff = nowRect.w - nowRectWidth;
      let ySizeDiff = nowRect.h - nowRectHeight;

      nowCenterX += random(-0.5, 0.5) * xSizeDiff;
      nowCenterY += random(-0.5, 0.5) * ySizeDiff;

      let nowRectRotation = random(-10, 10);
      // nowRectRotation = 0.0;

      let newRect = new RefractionObj(nowCenterX, nowCenterY, nowRectWidth, nowRectHeight, nowRectRotation);
      refractors.push(newRect);
    }
  }


  // draw all refractors
  for (let i = 0; i < refractors.length; i++) {
    refractors[i].draw();
    await sleep(1);
  }

  // prepare beams
  let beams = [];

  // draw beams
  _mainHue -= 60;

  if (BEAM_SPAWN_TYPE == 0) {

    let beamXCount = int(random(20, 60));
    let beamYCount = 10;

    let beamPadding = 0.5 * padding;
    let beamRectWidth = (width - 2 * beamPadding) / beamXCount;
    let beamRectHeight = (height - 2 * beamPadding) / beamYCount;

    let beamRotationOffset = random(-40, 40);
    if (random() < 0.12)
      beamRotationOffset = 0.0;

    // up row
    for (let x = 0; x < beamXCount; x++) {
      let nowX = beamPadding + x * beamRectWidth - 0.25 * beamRectWidth;
      let nowY = beamPadding;
      let rectCenterX = nowX + beamRectWidth * 0.5;
      let rectCenterY = nowY;

      let nowRectWidth = beamRectWidth * 0.8;
      let nowRectHeight = beamRectHeight * 0.8;

      let beamRotation = 180 + beamRotationOffset;

      let beamColor = NYColor.newRandomColor(_mainHue);
      if (random() < 0.12)
        beamColor.h = processHue(beamColor.h + 180);
      let newBeam = new Beam(rectCenterX, rectCenterY, beamRotation, beamColor);
      beams.push(newBeam);
    }

    // bottom row
    for (let x = 0; x < beamXCount; x++) {
      let nowX = beamPadding + x * beamRectWidth + 0.25 * beamRectWidth;
      let nowY = height - beamPadding;
      let rectCenterX = nowX + beamRectWidth * 0.5;
      let rectCenterY = nowY;

      let beamRotation = beamRotationOffset;

      let beamColor = NYColor.newRandomColor(_mainHue);
      if (random() < 0.12)
        beamColor.h = processHue(beamColor.h + 180);
      let newBeam = new Beam(rectCenterX, rectCenterY, beamRotation, beamColor);
      beams.push(newBeam);
    }
  }
  else if (BEAM_SPAWN_TYPE == 1) {

    let beamYCount = int(random(20, 60));

    let beamPadding = 0.5 * padding;
    let beamRectHeight = (height - 2 * beamPadding) / beamYCount;

    let beamRotationOffset = random(-40, 40);
    if (random() < 0.12)
      beamRotationOffset = 0.0;

    // left row
    for (let y = 0; y < beamYCount; y++) {
      let nowX = beamPadding;
      let nowY = beamPadding + y * beamRectHeight - 0.25 * beamRectHeight;
      let rectCenterX = nowX;
      let rectCenterY = nowY + 0.5 * beamRectHeight;

      let beamRotation = 90 + beamRotationOffset;

      let beamColor = NYColor.newRandomColor(_mainHue);
      if (random() < 0.12)
        beamColor.h = processHue(beamColor.h + 180);
      let newBeam = new Beam(rectCenterX, rectCenterY, beamRotation, beamColor);
      beams.push(newBeam);
    }

    // right row
    for (let y = 0; y < beamYCount; y++) {
      let nowX = width - beamPadding;
      let nowY = beamPadding + y * beamRectHeight - 0.25 * beamRectHeight;
      let rectCenterX = nowX;
      let rectCenterY = nowY + 0.5 * beamRectHeight;

      let beamRotation = 270 + beamRotationOffset;

      let beamColor = NYColor.newRandomColor(_mainHue);
      if (random() < 0.12)
        beamColor.h = processHue(beamColor.h + 180);
      let newBeam = new Beam(rectCenterX, rectCenterY, beamRotation, beamColor);
      beams.push(newBeam);
    }
  }



  blendMode(ADD);
  for (let i = 0; i < beams.length; i++) {

    stroke('white');
    fill('yellow');
    strokeWeight(1);
    circle(beams[i].x, beams[i].y, 8);

    let nowBeam = beams[i];
    let nowN1 = 1.000293;
    let nowN2 = 1.52;
    let isInsideRefractor = false;

    while (true) {
      await sleep(1);

      let targetRefrector = findTargetRefractor(nowBeam, refractors);
      if (targetRefrector == null) {
        // console.log("LAST BEAm DRAW");
        // console.log(nowBeam);
        nowBeam.draw();
        break;
      }

      let refrectResult = getBeamRefractorResult(nowBeam, targetRefrector, nowN1, nowN2);
      // console.log(refrectResult);

      if (refrectResult != false) {

        if (isInsideRefractor) {
          let beamRGB = nowBeam.color.toRgb();
          let refractorRGB = targetRefrector.color.toRgb();
          let segmentColor = {
            r: (beamRGB.r + refractorRGB.r),
            g: (beamRGB.g + refractorRGB.g),
            b: (beamRGB.b + refractorRGB.b)
          };

          colorMode(RGB);
          stroke(segmentColor.r, segmentColor.g, segmentColor.b);
        }
        else {
          colorMode(HSB);
          stroke(nowBeam.color.h, nowBeam.color.s, nowBeam.color.b);
        }

        let newSegment = new LineData(nowBeam.x, nowBeam.y, refrectResult.contactPoint.x, refrectResult.contactPoint.y);
        newSegment.draw();

        let beamColor = nowBeam.color.copy();
        nowBeam = new Beam(refrectResult.contactPoint.x, refrectResult.contactPoint.y, refrectResult.newAngle, beamColor);
        nowN1 = refrectResult.newN1;
        nowN2 = refrectResult.newN2;

        if (refrectResult.isReflect == false)
          isInsideRefractor = !isInsideRefractor;
      }
      else {
        // console.log("DRAW LAST BEAM?");
        // console.log(nowBeam);
        nowBeam.draw();
        break;
      }
    }
  }

  // await sleep(2000);
  // window.location.reload();
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}