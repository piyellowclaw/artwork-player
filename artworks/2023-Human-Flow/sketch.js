
let pieceRotRandomness = 0;

let mainHue = 0;
let nowFillColorA;
let nowFillColorB;

let DO_POS_OFFSET = false;

async function setup() {

  console.log(fxhash);
  randomSeed(fxrand() * 1000000);

  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB);
  background(0, 0, 6);
  // clear();


  pieceRotRandomness = random(10, 60);
  if (random() < 0.24)
    pieceRotRandomness = 12;

  if (random() < 0.12)
    pieceRotRandomness = random(60, 90);

  mainHue = random(0, 360);


  // push();
  // translate(windowWidth / 2, windowHeight / 2);
  // let size = 600;
  // fill(0, 0, 30);
  // rect(-0.5 * size, -0.5 * size, size, size);
  // pop();


  // nowFillColorA = NYColor.newRandomColor(mainHue);
  // nowFillColorB = NYColor.newRandomColor(mainHue);

  // let testHuman = new Human(windowWidth / 2, windowHeight / 2, randomBodyPose(), 1.0);
  // testHuman.drawAll();

  let xCount = int(random(6, 48));
  let yCount = int(random(6, 48));


  let xSize = width / xCount;
  let ySize = height / yCount;

  let humanScale = max(xSize, ySize) / 600 * 1.2;

  let padding = 0.1 * min(width, height);

  let bodyPoses = [];
  bodyPoses[0] = [];
  bodyPoses[1] = [];
  bodyPoses[2] = [];

  bodyPoses[0][0] = randomBodyPose();
  bodyPoses[0][1] = randomBodyPose();
  bodyPoses[0][2] = randomBodyPose();
  bodyPoses[1][0] = randomBodyPose();
  bodyPoses[1][1] = randomBodyPose();
  bodyPoses[1][2] = randomBodyPose();
  bodyPoses[2][0] = randomBodyPose();
  bodyPoses[2][1] = randomBodyPose();
  bodyPoses[2][2] = randomBodyPose();

  // A --- B
  // |     |
  // C --- D

  let ax = 0;
  let ay = 0;
  let bx = 0;
  let by = 0;
  let cx = 0;
  let cy = 0;
  let dx = 0;
  let dy = 0;

  let colors = [];
  colors[0] = [];
  colors[1] = [];

  colors[0][0] = NYColor.newRandomColor(mainHue);
  colors[0][1] = NYColor.newRandomColor(mainHue);
  colors[1][0] = NYColor.newRandomColor(mainHue);
  colors[1][1] = NYColor.newRandomColor(mainHue);

  for (let y = 0; y < yCount; y++) {
    for (let x = 0; x < xCount; x++) {
      let xt = x / (xCount - 1);
      let yt = y / (yCount - 1);

      let poseXt = 0.0;
      let poseYt = 0.0;

      if (xt < 0.5) {
        ax = 0;
        bx = 1;
        cx = 0;
        dx = 1;
        poseXt = xt * 2;
      }
      else {
        ax = 1;
        bx = 2;
        cx = 1;
        dx = 2;
        poseXt = (xt - 0.5) * 2;
      }

      if (yt < 0.5) {
        ay = 0;
        by = 0;
        cy = 1;
        dy = 1;
        poseYt = yt * 2;
      }
      else {
        ay = 1;
        by = 1;
        cy = 2;
        dy = 2;
        poseYt = (yt - 0.5) * 2;
      }

      let nowColorY_A = NYLerpColor(colors[0][0], colors[0][1], yt);
      let nowColorY_B = NYLerpColor(colors[1][0], colors[1][1], yt);

      let nowColor = NYLerpColor(nowColorY_A, nowColorY_B, xt);

      // random fill color
      nowFillColorA = nowColor.copy();
      nowFillColorA.slightRandomize(20, 20, 60);
      nowFillColorB = nowColor.copy();
      nowFillColorB.slightRandomize(20, 20, 60);

      let colorRand = random();
      if (colorRand < 0.24) {
        nowFillColorA.h = processHue(nowFillColorA.h + 180);
        nowFillColorB.h = processHue(nowFillColorB.h + 180);
      }
      else if (colorRand < 0.36) {
        nowFillColorA = new NYColor(0, 0, 100);
        nowFillColorB = new NYColor(0, 0, 100);
      }

      let xPoseFrom = lerpData(bodyPoses[ax][ay], bodyPoses[cx][cy], poseYt);
      let xPoseTo = lerpData(bodyPoses[bx][by], bodyPoses[dx][dy], poseYt);

      let nowPose = lerpData(xPoseFrom, xPoseTo, poseXt);

      let nowX = lerp(padding, width - padding, xt);
      let nowY = lerp(padding, height - padding, yt);

      if (DO_POS_OFFSET) {
        nowX += random(-0.35, 0.35) * xSize;
        nowY += random(-0.35, 0.35) * ySize;
      }

      let nowHuman = new Human(nowX, nowY, nowPose, humanScale);
      nowHuman.drawAll();

      await sleep(1);
    }
  }

  // blendMode(ADD);
  // image(paperImg, 0, 0, width, height);
  // await sleep(2000);
  // let imgName = 'humanFlow-1000x1000-' + fxhash + '.png';
  // save(imgName);

  // await sleep(2000);
  // window.location.reload();
}

async function draw() {

}

function drawLerpBody(_fromPos, _toPos, _fromData, _toData, _count) {
  for (let i = 0; i < _count; i++) {
    let t = i / (_count - 1);
    let nowPos = lerpData(_fromPos, _toPos, t);
    let nowData = lerpData(_fromData, _toData, t);

    console.log(nowPos);
    let nowHuman = new Human(nowPos.x, nowPos.y, nowData, 0.6);
    nowHuman.drawAll();
  }
}

function lerpData(_from, _to, _t) {
  let result = {};
  for (let key in _from) {
    result[key] = lerp(_from[key], _to[key], _t);
  }
  return result;
}

function randomBodyPose() {

  let poses = [];

  // 0: stand
  poses.push({
    hipsX: -80,
    hipsY: -10,
    hips: -30,
    spine: 20,
    chest: 0,
    neck: 30,
    head: 0,

    leftShoulder: 0,
    leftUpArm: -60,
    leftForeArm: -50,
    leftHand: -30,

    rightShoulder: 0,
    rightUpArm: 60,
    rightForeArm: -50,
    rightHand: 60,

    leftHip: 0,
    leftUpLeg: -40,
    leftForeLeg: 60,
    leftFoot: 30,

    rightHip: 0,
    rightUpLeg: -20,
    rightForeLeg: 10,
    rightFoot: 40
  });

  // a: run A
  poses.push({
    hipsX: 0,
    hipsY: 120,
    hips: 40,
    spine: 20,
    chest: 0,
    neck: 30,
    head: -40,

    leftShoulder: 30,
    leftUpArm: -120,
    leftForeArm: -80,
    leftHand: -30,

    rightShoulder: 30,
    rightUpArm: 0,
    rightForeArm: -30,
    rightHand: -30,

    leftHip: 20,
    leftUpLeg: 30,
    leftForeLeg: 20,
    leftFoot: 30,

    rightHip: -30,
    rightUpLeg: -50,
    rightForeLeg: 120,
    rightFoot: -20
  });

  // 2: run B
  poses.push({
    hipsX: 0,
    hipsY: 30,
    hips: 30,
    spine: 20,
    chest: 0,
    neck: 30,
    head: -40,

    leftShoulder: 70,
    leftUpArm: -20,
    leftForeArm: -30,
    leftHand: -30,

    rightShoulder: -160,
    rightUpArm: 60,
    rightForeArm: -80,
    rightHand: -30,

    leftHip: -30,
    leftUpLeg: -20,
    leftForeLeg: 100,
    leftFoot: 40,

    rightHip: -0,
    rightUpLeg: 30,
    rightForeLeg: 20,
    rightFoot: 60
  });

  // 3: stand A
  poses.push({
    hipsX: 0,
    hipsY: 0,
    hips: 0,
    spine: -20,
    chest: 0,
    neck: 20,
    head: 20,

    leftShoulder: 0,
    leftUpArm: 20,
    leftForeArm: -30,
    leftHand: 30,

    rightShoulder: 30,
    rightUpArm: 30,
    rightForeArm: -110,
    rightHand: 60,

    leftHip: -10,
    leftUpLeg: -6,
    leftForeLeg: 30,
    leftFoot: -10,

    rightHip: 0,
    rightUpLeg: -3,
    rightForeLeg: 8,
    rightFoot: 0
  });

  // 4: stand B
  poses.push({
    hipsX: 50,
    hipsY: 0,
    hips: 0,
    spine: -20,
    chest: 0,
    neck: -10,
    head: -10,

    leftShoulder: -40,
    leftUpArm: -80,
    leftForeArm: -120,
    leftHand: 30,

    rightShoulder: 30,
    rightUpArm: 30,
    rightForeArm: -110,
    rightHand: 60,

    leftHip: -10,
    leftUpLeg: -6,
    leftForeLeg: 30,
    leftFoot: -10,

    rightHip: 0,
    rightUpLeg: -3,
    rightForeLeg: 8,
    rightFoot: 0
  });

  // 5: kneel A
  poses.push({
    hipsX: 60,
    hipsY: 140,
    hips: 30,
    spine: 20,
    chest: 0,
    neck: -10,
    head: -10,

    leftShoulder: 60,
    leftUpArm: 0,
    leftForeArm: -100,
    leftHand: 60,

    rightShoulder: -120,
    rightUpArm: 60,
    rightForeArm: -20,
    rightHand: -20,

    leftHip: -30,
    leftUpLeg: -80,
    leftForeLeg: 120,
    leftFoot: -0,

    rightHip: -10,
    rightUpLeg: -10,
    rightForeLeg: 120,
    rightFoot: -30
  });

  // kneel B
  poses.push({
    hipsX: 30,
    hipsY: 140,
    hips: 20,
    spine: 10,
    chest: 0,
    neck: 30,
    head: 20,

    leftShoulder: 80,
    leftUpArm: -120,
    leftForeArm: -20,
    leftHand: -10,

    rightShoulder: -30,
    rightUpArm: -40,
    rightForeArm: -40,
    rightHand: 60,

    leftHip: 30,
    leftUpLeg: -60,
    leftForeLeg: 130,
    leftFoot: 20,

    rightHip: -80,
    rightUpLeg: -10,
    rightForeLeg: 120,
    rightFoot: -30
  });

  // jump A
  poses.push({
    hipsX: 160,
    hipsY: -40,
    hips: -20,
    spine: 10,
    chest: 10,
    neck: 10,
    head: -20,

    leftShoulder: 0,
    leftUpArm: -100,
    leftForeArm: -110,
    leftHand: -30,

    rightShoulder: -60,
    rightUpArm: -140,
    rightForeArm: -60,
    rightHand: -30,

    leftHip: -20,
    leftUpLeg: -20,
    leftForeLeg: 150,
    leftFoot: -10,

    rightHip: -30,
    rightUpLeg: -90,
    rightForeLeg: 130,
    rightFoot: -60
  });

  // 8: jump B
  poses.push({
    hipsX: -220,
    hipsY: 220,
    hips: -30,
    spine: 20,
    chest: 10,
    neck: 0,
    head: 30,

    leftShoulder: 0,
    leftUpArm: 30,
    leftForeArm: -120,
    leftHand: -30,

    rightShoulder: -30,
    rightUpArm: 30,
    rightForeArm: -120,
    rightHand: -20,

    leftHip: -30,
    leftUpLeg: -60,
    leftForeLeg: 20,
    leftFoot: 60,

    rightHip: -60,
    rightUpLeg: -60,
    rightForeLeg: 120,
    rightFoot: -30
  });

  // pose left
  poses.push({
    hipsX: -220,
    hipsY: 120,
    hips: 10,
    spine: 20,
    chest: -10,
    neck: 20,
    head: -30,

    leftShoulder: -20,
    leftUpArm: -60,
    leftForeArm: -60,
    leftHand: 30,

    rightShoulder: 0,
    rightUpArm: 30,
    rightForeArm: -120,
    rightHand: -40,

    leftHip: -40,
    leftUpLeg: -30,
    leftForeLeg: 20,
    leftFoot: 50,

    rightHip: 40,
    rightUpLeg: -120,
    rightForeLeg: 120,
    rightFoot: -40
  });

  // pose right
  poses.push({
    hipsX: 140,
    hipsY: 120,
    hips: 10,
    spine: -10,
    chest: -10,
    neck: -10,
    head: -20,

    leftShoulder: 0,
    leftUpArm: -130,
    leftForeArm: -60,
    leftHand: -30,

    rightShoulder: 40,
    rightUpArm: 10,
    rightForeArm: 60,
    rightHand: 30,

    leftHip: -40,
    leftUpLeg: -30,
    leftForeLeg: 100,
    leftFoot: -20,

    rightHip: 30,
    rightUpLeg: 20,
    rightForeLeg: 10,
    rightFoot: 60
  });

  // up right
  poses.push({
    hipsX: 140,
    hipsY: -30,
    hips: -20,
    spine: -20,
    chest: -10,
    neck: -10,
    head: -10,

    leftShoulder: -30,
    leftUpArm: -80,
    leftForeArm: -120,
    leftHand: 30,

    rightShoulder: 10,
    rightUpArm: 140,
    rightForeArm: -20,
    rightHand: -20,

    leftHip: -20,
    leftUpLeg: -100,
    leftForeLeg: 140,
    leftFoot: 80,

    rightHip: -20,
    rightUpLeg: 40,
    rightForeLeg: 10,
    rightFoot: 70
  });

  // pose upper left
  poses.push({
    hipsX: -120,
    hipsY: 0,
    hips: -20,
    spine: 10,
    chest: 10,
    neck: 10,
    head: -20,

    leftShoulder: 0,
    leftUpArm: -110,
    leftForeArm: -20,
    leftHand: 30,

    rightShoulder: -120,
    rightUpArm: 80,
    rightForeArm: -120,
    rightHand: 10,

    leftHip: 20,
    leftUpLeg: 0,
    leftForeLeg: 20,
    leftFoot: 30,

    rightHip: 0,
    rightUpLeg: 0,
    rightForeLeg: 0,
    rightFoot: 0
  });

  // pose up side down
  poses.push({
    hipsX: 60,
    hipsY: 0,
    hips: 130,
    spine: 0,
    chest: 0,
    neck: 0,
    head: 0,

    leftShoulder: 30,
    leftUpArm: -120,
    leftForeArm: -80,
    leftHand: 60,

    rightShoulder: -60,
    rightUpArm: 30,
    rightForeArm: -20,
    rightHand: 0,

    leftHip: -20,
    leftUpLeg: 20,
    leftForeLeg: 12,
    leftFoot: 0,

    rightHip: 30,
    rightUpLeg: 80,
    rightForeLeg: 80,
    rightFoot: 30
  });

  // upside down left
  poses.push({
    hipsX: -120,
    hipsY: -40,
    hips: -160,
    spine: -10,
    chest: -10,
    neck: -10,
    head: -10,

    leftShoulder: 0,
    leftUpArm: -120,
    leftForeArm: -60,
    leftHand: -60,

    rightShoulder: -60,
    rightUpArm: -130,
    rightForeArm: -20,
    rightHand: -60,

    leftHip: -160,
    leftUpLeg: 40,
    leftForeLeg: 60,
    leftFoot: 40,

    rightHip: -160,
    rightUpLeg: 30,
    rightForeLeg: 30,
    rightFoot: 60
  });

  // pose clean
  poses.push({
    hipsX: 100,
    hipsY: 140,
    hips: 20,
    spine: -10,
    chest: -6,
    neck: -6,
    head: -12,

    leftShoulder: 0,
    leftUpArm: -140,
    leftForeArm: -40,
    leftHand: -60,

    rightShoulder: 20,
    rightUpArm: 10,
    rightForeArm: 30,
    rightHand: 20,

    leftHip: -30,
    leftUpLeg: -60,
    leftForeLeg: 120,
    leftFoot: -60,

    rightHip: 40,
    rightUpLeg: 30,
    rightForeLeg: -20,
    rightFoot: 120
  });


  // moon pose
  poses.push({
    hipsX: 140,
    hipsY: 40,
    hips: -10,
    spine: -10,
    chest: -6,
    neck: -6,
    head: -6,

    leftShoulder: -30,
    leftUpArm: -120,
    leftForeArm: -60,
    leftHand: -30,

    rightShoulder: 0,
    rightUpArm: 110,
    rightForeArm: 20,
    rightHand: -30,

    leftHip: -60,
    leftUpLeg: 10,
    leftForeLeg: 120,
    leftFoot: -60,

    rightHip: 20,
    rightUpLeg: 10,
    rightForeLeg: 20,
    rightFoot: 40
  });

  // pose clean
  // poses.push({
  //   hipsX: 0,
  //   hipsY: 0,
  //   hips: 0,
  //   spine: 0,
  //   chest: 0,
  //   neck: 0,
  //   head: 0,

  //   leftShoulder: 0,
  //   leftUpArm: 0,
  //   leftForeArm: 0,
  //   leftHand: 0,

  //   rightShoulder: 0,
  //   rightUpArm: 0,
  //   rightForeArm: 0,
  //   rightHand: 0,

  //   leftHip: 0,
  //   leftUpLeg: 0,
  //   leftForeLeg: 0,
  //   leftFoot: 0,

  //   rightHip: 0,
  //   rightUpLeg: 0,
  //   rightForeLeg: 0,
  //   rightFoot: 0
  // });

  // return poses[14];
  // return poses[poses.length - 1];
  return random(poses);
}

// async sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

