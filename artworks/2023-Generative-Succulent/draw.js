async function drawPlantB(_x, _y, _radiusMax, _radiusMin, _layers, _countPerLayer) {

    _radiusMin = 0;
    let nowCurveType = random(curveTypes);

    let leafArcAngle = (360 / _countPerLayer) * random(0.6, 1.3);
    let leafBaseThickness = ((_radiusMax - _radiusMin) / _layers) * random(0.8, 3);

    let plantColor = randomPlantColor();

    // random leaf value
    leafCurveValue = random(0.1, 4);
    leafNoiseScale = random(0.001, 0.1);

    for (let i = 0; i < _layers; i++) {

        let lengthT = 1 - (i / (_layers - 1));
        let nowLength = lerp(_radiusMin, _radiusMax, lengthT);

        let rotAdd = 360 / _countPerLayer;
        let nowRot = random(0, 360);

        let briAdd = 40 * (i/(_layers-1));

        for (let j = 0; j < _countPerLayer; j++) {
            let nowLeafDrawAngle = leafArcAngle * random(0.8, 1.2);
            let nowLeafThickness = leafBaseThickness * random(0.8, 1.2);
            let nowDistanceFromCenter = nowLength * random(0.8, 1.2);

            let leafColor = randomLeafColor(plantColor[0], plantColor[1], plantColor[2]);

            nowRot += rotAdd * random(0.6, 1.4);
            NYSetColor(leafColor[0], leafColor[1], leafColor[2] + briAdd, 0.8);
            drawArcLeaf(_x, _y, nowDistanceFromCenter, nowRot, nowLeafDrawAngle, nowLeafThickness, nowCurveType);
        }

        await sleep(1);
    }
}

async function drawPlant(_x, _y, _radiusMax, _radiusMin, _leafWidth, _layers, _countPerLayer) {

    let nowCurveType = random(curveTypes);
    let nowLeafWidth = _leafWidth;

    randomPlantColor();

    // random leaf value
    leafCurveValue = random(0.1, 4);
    leafNoiseScale = random(0.001, 0.1);

    for (let i = 0; i < _layers; i++) {

        let lengthT = 1 - (i / (_layers - 1));
        let nowLength = lerp(0, _radiusMax, lengthT);

        let rotAdd = 360 / _countPerLayer;
        let nowRot = random(0, 360);

        let nowLeafWidth = _leafWidth * (nowLength / _radiusMax);

        for (let j = 0; j < _countPerLayer; j++) {

            nowRot += rotAdd * random(0.6, 1.4);
            drawLeaf(_x, _y, nowLeafWidth, nowLength, nowRot, nowCurveType);
        }

        await sleep(1);
    }
}

function drawLeaf(_x, _y, _width, _length, _angle, _curve) {
    let drawCount = _length * lineDensity;
    randomLeafColor();

    let lineBriAdd = 0;

    for (let i = 0; i < drawCount; i++) {
        let t = i / drawCount;
        let widthT = _curve(1 - t);

        lineBriAdd = 20 * t;

        let baseX = _x + sin(radians(_angle)) * _length * t;
        let baseY = _y - cos(radians(_angle)) * _length * t;

        _angle += lerp(-leafCurveValue, leafCurveValue, noise(baseX * leafNoiseScale, baseY * leafNoiseScale, -600));

        let fromX = baseX + sin(radians(_angle - 90)) * _width * 0.5 * widthT;
        let fromY = baseY - cos(radians(_angle - 90)) * _width * 0.5 * widthT;

        let toX = baseX + sin(radians(_angle + 90)) * _width * 0.5 * widthT;
        let toY = baseY - cos(radians(_angle + 90)) * _width * 0.5 * widthT;

        // fill(leafHue, leafSat, leafBri + lineBriAdd);
        stroke(leafHue, leafSat, leafBri + lineBriAdd, 0.8);
        NYLine(fromX, fromY, toX, toY);
    }
}

async function drawArcLeaf(_centerX, _centerY, _radius, _drawDir, _drawAngle, _thickness, _thicknessCurve) {

    _radius = max(_radius, 0.5);
    randomLeafColor();

    let circleLength = _radius * radians(_drawAngle);

    let drawCount = floor(circleLength * lineDensity);

    let startAngle = _drawDir - 0.5 * _drawAngle;

    for (let i = 0; i < drawCount; i++) {

        let t = i / (drawCount - 1);
        let nowDegree = startAngle + _drawAngle * t;

        let curveT = _thicknessCurve(t * 2);
        if (t > 0.5) curveT = _thicknessCurve((1 - t) * 2);

        let nowThickness = _thickness * curveT;
        if (nowThickness == 0)
            nowThickness = 1;

        let x1 = _centerX + sin(radians(nowDegree)) * (_radius - nowThickness * 0.5);
        let y1 = _centerY - cos(radians(nowDegree)) * (_radius - nowThickness * 0.5);

        let x2 = _centerX + sin(radians(nowDegree)) * (_radius + nowThickness * 0.5);
        let y2 = _centerY - cos(radians(nowDegree)) * (_radius + nowThickness * 0.5);

        // NYDotLine(x1, y1, x2, y2);
        NYLine(x1, y1, x2, y2);
    }
}





function NYDotLine(_x1, _y1, _x2, _y2) {
    let distance = dist(_x1, _y1, _x2, _y2);
    let points = distance * dotDensity;

    for (let i = 0; i <= points; i++) {
        let x = lerp(_x1, _x2, i / points);
        let y = lerp(_y1, _y2, i / points);

        let size = noise(x * 0.1, y * 0.1, 600) * 12 + 1;
        // x -= 0.5 * size;

        let tempHue = nowHue + random(-5, 5);
        let tempSat = nowSat + random(-5, 5);
        let tempBri = nowBri + random(-5, 5);

        if(random() < 0.1)
        {
            tempHue = nowHue + random(-60, 60);
            if(tempHue < 0)
                tempHue += 360;
            else if(tempHue > 360)
                tempHue -= 360;
            tempSat = nowSat + random(-20, 20);
            tempBri = nowBri + random(-20, 20);
        }

        noStroke();
        fill(tempHue, tempSat, tempBri, 0.8);

        circle(x, y, size);
    }
}

function NYLine(_x1, _y1, _x2, _y2) {
    let distance = dist(_x1, _y1, _x2, _y2);
    if (distance < 1)
        return;

    let points = distance * dotDensity;

    for (let i = 0; i <= points; i++) {
        let x = lerp(_x1, _x2, i / points);
        let y = lerp(_y1, _y2, i / points);

        randomBrushColor(10, 10, 10);
        NYStrokePoint(x, y);
    }
}

function NYStrokePoint(_x, _y) {
    let strokeLength = noise(_x * noiseScaleX, _y * noiseScaleY, 600) * baseLineLength;
    let strokeThickness = noise(_x * noiseScaleX, _y * noiseScaleY, 1280) * baseLineThickness + 1;

    push();
    strokeWeight(strokeThickness);
    translate(_x, _y);
    rotate(noise(_x * noiseScaleX, _y * noiseScaleY, 321) * 60);
    line(0, -0.5 * strokeLength, 0, 0.5 * strokeLength);
    pop();
}

function randomBowlColor() {
    let bowlHue = mainHue + random(-30, 30);
    let bowlSat = random(40, 60);
    let bowlBri = random(80, 100);

    if (random() < 0.2)
        bowlHue += 180;

    if (random() < 0.1) {
        bowlSat = 0;
        bowlBri = random(90, 100);
    }

    if (bowlHue > 360)
        bowlHue -= 360;
    else if (bowlHue < 0)
        bowlHue += 360;

    return [bowlHue, bowlSat, bowlBri];
}

function randomPlantColor() {
    // plantHue = mainHue + random(-30, 30);
    let plantHue = random(80, 140);
    let plantSat = random(10, 60);
    let plantBri = random(40, 60);

    return [plantHue, plantSat, plantBri];
}

function randomLeafColor(_plantHue, _plantSat, _plantBri) {
    let leafHue = _plantHue + random(-20, 20);
    let leafSat = _plantSat + random(-10, 10);
    let leafBri = _plantBri + random(-5, 5);

    return [leafHue, leafSat, leafBri];
}

function randomDirtColor() {
    let dirtHue = random(10, 60);
    let dirtSat = random(5, 20);
    let dirtBri = random(80, 100);

    return [dirtHue, dirtSat, dirtBri];
}

function NYSetColorLerp(_hueA, _satA, _briA, _hueB, _satB, _briB, t) {
    let nowColor = NYLerpColor(color(_hueA, _satA, _briA), color(_hueB, _satB, _briB), t);
    nowHue = hue(nowColor);
    nowSat = saturation(nowColor);
    nowBri = brightness(nowColor);

    stroke(nowHue, nowSat, nowBri, nowAlpha);
}

function NYSetColor(_hue, _sat, _bri, _alpha = 1.0) {
    nowHue = _hue;
    nowSat = _sat;
    nowBri = _bri;
    nowAlpha = _alpha;

    stroke(nowHue, nowSat, nowBri, nowAlpha);
}

function randomBrushColor(_hueRange, _satRange, _briRange) {
    let tempHue = nowHue + random(-_hueRange, _hueRange);
    let tempSat = nowSat + random(-_satRange, _satRange);
    let tempBri = nowBri + random(-_briRange, _briRange);

    if (tempHue > 360)
        tempHue -= 360;
    else if (tempHue < 0)
        tempHue += 360;

    stroke(tempHue, tempSat, tempBri, 0.8);
}
