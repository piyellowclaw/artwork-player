
function drawGradientRect(_x, _y, _w, _h, _mainHue, _mainSat, _mainBri, _seed, _targetGraphic) {
    randomSeed(_seed);
    noiseSeed(_seed);

    _tempCardGraphic.resizeCanvas(_w, _h);
    _tempCardGraphic.clear();

    _targetGraphic.colorMode(HSB);

    let hueA = processHue(_mainHue);
    let satA = _mainSat;
    let briA = _mainBri;

    let hueB = processHue(_mainHue + random(30, 60));
    let satB = _mainSat + random(-10, 10);
    let briB = _mainBri + random(-10, 10);

    let isLeftRightGradient = random() < 0.5;
    let isVertical = random() < 0.5;

    let colorDataA = new ColorData(hueA, satA, briA);
    let colorDataB = new ColorData(hueB, satB, briB);

    let xSpacing = _w / random(10, 60);
    let ySpacing = _h / random(10, 60);


    for (let x = 0; x < _w; x += xSpacing) {
        for (let y = 0; y < _h; y += ySpacing) {

            let t = 0;
            if (isLeftRightGradient)
                t = x / _w;
            else
                t = y / _h;

            let nowColor = NYLerpColorData(colorDataA, colorDataB, t);

            nowColor.h += random(-6, 6);
            nowColor.s += random(-6, 6);
            nowColor.b += random(-6, 6);

            _tempCardGraphic.stroke(nowColor.h, nowColor.s, nowColor.b);
            _tempCardGraphic.strokeWeight(random(2, 4));
            _tempCardGraphic.blendMode(MULTIPLY);

            let x1 = x;
            let y1 = y;
            let x2 = x;
            let y2 = y;

            if (isVertical)
                y2 += ySpacing;
            else
                x2 += xSpacing;

            _tempCardGraphic.line(x1, y1, x2, y2);
        }
    }

    _targetGraphic.image(_tempCardGraphic, _x, _y);

    // for (let x = 0; x < _w; x++) {
    //     let startX = _x + x;
    //     let startY = _y;

    //     let nowColor = NYLerpColor(colorA, colorB, x / _w);
    //     _targetGraphic.noStroke();
    //     _targetGraphic.fill(nowColor);
    //     _targetGraphic.rect(startX, startY, 1, _h);
    // }


    // drawFrame
    let frameThickness = min(_w, _h) * 0.01;

    if (frameThickness < 2)
        frameThickness = 2;

    // let frameBri = random(0, 10);
    // if (random() < 0.5)
    //     frameBri = 100 - frameBri;

    // if(random() < 0.1)
    //     frameBri = 100;

    let frameBri = 12;

    if (BLACK_FRAME)
        frameBri = 0;
    else
        frameBri = 100;

    _targetGraphic.noStroke();
    _targetGraphic.fill(0, 0, frameBri);
    _targetGraphic.rect(_x, _y, _w, frameThickness);
    _targetGraphic.rect(_x, _y, frameThickness, _h);
    _targetGraphic.rect(_x + _w - frameThickness, _y, frameThickness, _h);
    _targetGraphic.rect(_x, _y + _h - frameThickness, _w, frameThickness);
}

// draw line rects
function drawStyledRect(_x, _y, _w, _h, _mainHue, _mainSat, _mainBri, _seed, _targetGraphic) {
    randomSeed(_seed);

    let xSlices = int(random(10, 60));
    let ySlices = int(random(10, 60));

    let sliceRandom = random();
    if (sliceRandom < 0.3)
        xSlices = 1;
    else if (sliceRandom < 0.6)
        ySlices = 1;

    let sliceWidth = _w / xSlices;
    let sliceHeight = _h / ySlices;

    for (let x = 0; x < xSlices; x++) {
        for (let y = 0; y < ySlices; y++) {

            let drawHue = processHue(_mainHue + random(-10, 10));

            let drawSat = _mainSat + random(-10, 10);
            let drawBri = _mainBri + random(-10, 10);

            let startX = _x + x * sliceWidth;
            let startY = _y + y * sliceHeight;
            _targetGraphic.noStroke();
            _targetGraphic.fill(drawHue, drawSat, drawBri);
            _targetGraphic.rect(startX, startY, sliceWidth, sliceHeight);
        }
    }

    // drawFrame
    let frameThickness = 2;

    // let frameBri = random(0, 10);
    // if (random() < 0.5)
    //     frameBri = 100 - frameBri;

    // if(random() < 0.1)
    //     frameBri = 100;
    let frameBri = 100;

    _targetGraphic.fill(0, 0, frameBri);
    _targetGraphic.rect(_x, _y, _w, frameThickness);
    _targetGraphic.rect(_x, _y, frameThickness, _h);
    _targetGraphic.rect(_x + _w - frameThickness, _y, frameThickness, _h);
    _targetGraphic.rect(_x, _y + _h - frameThickness, _w, frameThickness);
}

function processHue(_hue) {
    let hue = _hue % 360;
    if (hue < 0)
        hue += 360;

    return hue;
}



// calculate angle between two points
function getAngleDegreeFromTop(_p1, _p2) {
    let dx = _p2.x - _p1.x;
    let dy = _p2.y - _p1.y;

    return Math.atan2(dy, dx) * 180 / Math.PI + 90;
}

function getMirrorPoint(_leftPoint, _rightPoint, _centerPoint) {
    let lineAngle = getAngleDegreeFromTop(_leftPoint, _rightPoint);
    let angleToCenter = getAngleDegreeFromTop(_leftPoint, _centerPoint);

    let angleDiff = lineAngle - angleToCenter;
    let finalAngle = lineAngle + angleDiff;

    let distToCenter = dist(_leftPoint.x, _leftPoint.y, _centerPoint.x, _centerPoint.y);

    let finalX = _leftPoint.x + distToCenter * sin(radians(finalAngle));
    let finalY = _leftPoint.y + distToCenter * -cos(radians(finalAngle));

    return new Point(finalX, finalY);
}

function NYLerpColorData(_colorDataA, _colorDataB, _t) {
    let hueA = _colorDataA.h;
    let hueB = _colorDataB.h;

    let hueDiff = abs(hueB - hueA);

    if (abs((hueB - 360) - hueA) < hueDiff) {
        hueB -= 360;
    }
    else if (abs((hueB + 360) - hueA) < hueDiff) {
        hueB += 360;
    }
    else {
        let nowH = lerp(_colorDataA.h, _colorDataB.h, _t);
        let nowS = lerp(_colorDataA.s, _colorDataB.s, _t);
        let nowB = lerp(_colorDataA.b, _colorDataB.b, _t);
        let nowA = lerp(_colorDataA.a, _colorDataB.a, _t);

        return new ColorData(nowH, nowS, nowB, nowA);
    }

    let resultHue = lerp(hueA, hueB, _t);
    let resultSat = lerp(_colorDataA.s, _colorDataB.s, _t);
    let resultBri = lerp(_colorDataA.b, _colorDataB.b, _t);
    let resultAlpha = lerp(_colorDataA.a, _colorDataB.a, _t);

    resultHue = processHue(resultHue);

    return new ColorData(resultHue, resultSat, resultBri, resultAlpha);
}

function NYLerpColor(_colorA, _colorB, _t) {
    let hueA = hue(_colorA);
    let hueB = hue(_colorB);

    let hueDiff = abs(hueB - hueA);

    if (abs((hueB - 360) - hueA) < hueDiff) {
        hueB -= 360;
    }
    else if (abs((hueB + 360) - hueA) < hueDiff) {
        hueB += 360;
    }
    else {
        return lerpColor(_colorA, _colorB, _t);
    }

    let satA = saturation(_colorA);
    let briA = brightness(_colorA);
    let alphaA = alpha(_colorA);

    let satB = saturation(_colorB);
    let briB = brightness(_colorB);
    let alphaB = alpha(_colorB);

    let resultHue = lerp(hueA, hueB, _t);
    let resultSat = lerp(satA, satB, _t);
    let resultBri = lerp(briA, briB, _t);
    let resultAlpha = lerp(alphaA, alphaB, _t);

    if (resultHue < 0) {
        resultHue += 360;
    }
    else if (resultHue > 360) {
        resultHue -= 360;
    }

    return color(resultHue, resultSat, resultBri, resultAlpha);
}
