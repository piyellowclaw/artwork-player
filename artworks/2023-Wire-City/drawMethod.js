
let mainHue = Math.floor(Math.random() * 360);
let baseSat = 40;
let baseBri = 40;

let drawNS_X = 0.01;
let drawNS_Y = 0.01;

let bgNS_X = 0.06;
let bgNS_Y = 0.03;

let lineDensity = 0.6;
let lineThickness = 6;
let lineLength = 12;

let moonX = 0;
let moonY = 0;

let stickChance = 0.3;
let nodeBoxChance = 0.3;

function NYRoom(_x, _y, _width, _height, _colorA, _colorB) {

    let nodes = [];
    let hasStick = false;

    // has stick
    if (random() < 0.2) {
        nodes = drawStick(_x, _y, _width, _height, _colorA, _colorB);
        hasStick = true;
    }

    NYRect(_x, _y, _width, _height, _colorA, _colorB);

    // has windows
    if (random() < 0.6) {
        let windowType = floor(random(0, 3));

        if (windowType == 0) {
            let windowSizeX = random(2, 10);
            let windowSizeY = random(2, 10);

            if (windowSizeY < 0.1 * _height)
                windowSizeY = 0.1 * _height;

            let windowSpace = max(windowSizeX, windowSizeY) * random(1.4, 3);
            let windowCountX = floor(_width * 0.8 / windowSpace);

            let startX = _x + _width * random(0.04, 0.16);
            let startY = _y + random(0.1, 0.9) * _height;

            for (let i = 0; i < windowCountX; i++) {
                let xPos = startX + i * windowSpace;
                let yPos = startY;

                let whiteColorA = new NYColor(0, 0, 100, 1.0);
                let whiteColorB = new NYColor(0, 0, 100, 1.0);
                // NYRect(xPos, yPos, windowSizeX, windowSizeY, whiteColorA, whiteColorB);
                // fill('white');
                // rect(xPos, yPos, windowSizeX, windowSizeY);
                NYRect(xPos, yPos, windowSizeX, windowSizeY, whiteColorA, whiteColorB);
            }
        }
        else if (windowType == 1) {
            let windowSizeX = random(2, 10);
            let windowSizeY = random(2, 10);

            if (windowSizeX < 0.1 * _width)
                windowSizeX = 0.1 * _width;

            let windowSpace = max(windowSizeX, windowSizeY) * random(1.4, 3);
            let windowCountY = floor(_height * 0.8 / windowSpace);

            let startX = _x + random(0.1, 0.9) * _width;
            let startY = _y + _height * random(0.04, 0.16);

            for (let i = 0; i < windowCountY; i++) {
                let xPos = startX;
                let yPos = startY + i * windowSpace;

                let whiteColorA = new NYColor(0, 0, 100, 1.0);
                let whiteColorB = new NYColor(0, 0, 100, 1.0);
                // NYRect(xPos, yPos, windowSizeX, windowSizeY, whiteColorA, whiteColorB);
                // fill('white');
                // rect(xPos, yPos, windowSizeX, windowSizeY);
                NYRect(xPos, yPos, windowSizeX, windowSizeY, whiteColorA, whiteColorB);
            }
        }
    }

    // has node box
    if (!hasStick && random() < 0.3) {
        let nodeBoxWidth = min(random(0.1, 0.2) * _width, 20);
        let nodeBoxHeight = min(random(0.1, 0.2) * _height, 20);

        let nodeBoxX = _x + random(0.05, 0.15) * _width;
        if (random() < 0.5)
            nodeBoxX = _x + _width - nodeBoxWidth - random(0.05, 0.15) * _width;

        let nodeBoxY = _y + random(0.05, 0.15) * _height;
        if (random() < 0.5)
            nodeBoxY = _y + _height - nodeBoxHeight - random(0.05, 0.15) * _height;

        let nodeBoxColorA = _colorA.getRandomColor(0, 20, 20);
        let nodeBoxColorB = _colorB.getRandomColor(0, 20, 20);

        NYRect(nodeBoxX, nodeBoxY, nodeBoxWidth, nodeBoxHeight, nodeBoxColorA, nodeBoxColorB);

        strokeWeight(2);
        stroke(0, 0, 0, 0.6);
        noFill();
        rect(nodeBoxX, nodeBoxY, nodeBoxWidth, nodeBoxHeight);

        let nodeA = new NYNode(nodeBoxX, nodeBoxY + 0.5 * nodeBoxHeight);
        let nodeB = new NYNode(nodeBoxX + nodeBoxWidth, nodeBoxY + 0.5 * nodeBoxHeight);

        nodes.push(nodeA);
        nodes.push(nodeB);
    }

    return nodes;
}

function NYRect(_x, _y, _width, _height, _colorA, _colorB) {

    // draw vertical lines
    if (random() < 0.5) {
        let lineCountX = floor(_width * lineDensity);
        if (lineCountX == 0)
            lineCountX = 1;

        let lineSpacingX = _width / (lineCountX - 1);
        let lineCountY = floor(_height / lineLength);
        if (lineCountY == 0)
            lineCountY = 1;

        let drawLineLength = _height / (lineCountY);

        let fromColor = _colorA;
        let toColor = _colorB;

        for (let x = 0; x < lineCountX; x++) {
            for (let y = 0; y < lineCountY; y++) {
                let xPos = _x + x * lineSpacingX;
                let yPos = _y + y * drawLineLength;

                let sizeNoise = noise(xPos * drawNS_X, yPos * drawNS_Y);

                let nowColor = NYLerpColor(fromColor, toColor, y / lineCountY);
                let randomizedColor = nowColor.getRandomColor(4, 4, 4);
                randomizedColor.a = 0.8;
                randomizedColor.applyStroke();

                push();
                translate(xPos, yPos);

                strokeWeight(lineThickness * sizeNoise);
                line(0, 0, 0, drawLineLength);
                pop();
            }
        }
    }
    else // draw horizontal lines
    {
        let lineCountX = floor(_width / lineLength);
        if (lineCountX == 0)
            lineCountX = 1;

        let lineCountY = floor(_height * lineDensity);
        if (lineCountY == 0)
            lineCountY = 1;

        let lineSpacingY = _height / (lineCountY - 1);
        let drawLineLength = _width / (lineCountX);

        let fromColor = _colorA;
        let toColor = _colorB;

        for (let y = 0; y < lineCountY; y++) {
            for (let x = 0; x < lineCountX; x++) {
                let xPos = _x + x * drawLineLength;
                let yPos = _y + y * lineSpacingY;

                let sizeNoise = noise(xPos * drawNS_X, yPos * drawNS_Y);

                let nowColor = NYLerpColor(fromColor, toColor, x / lineCountX);
                let randomizedColor = nowColor.getRandomColor(4, 4, 4);
                randomizedColor.a = 0.8;
                randomizedColor.applyStroke();


                push();
                translate(xPos, yPos);

                strokeWeight(lineThickness * sizeNoise);
                line(0, 0, drawLineLength, 0);
                pop();
            }
        }
    }
}

function NYRectBG(_x, _y, _width, _height, _colorA, _colorB) {

    // draw vertical lines
    {
        let circleRadius = lineLength * random(1.0, 3.0);

        let lineCountX = floor(_width / circleRadius * random(0.6, 1.2));
        if (lineCountX == 0)
            lineCountX = 1;

        let lineCountY = floor(_height / circleRadius * random(1.2, 3.0));
        if (lineCountY == 0)
            lineCountY = 1;

        let lineSpacingY = _height / (lineCountY - 1);
        let drawLineLength = _width / (lineCountX);

        let fromColor = _colorA;
        let toColor = _colorB;

        for (let y = 0; y < lineCountY; y++) {
            for (let x = 0; x < lineCountX; x++) {
                let xPos = _x + x * drawLineLength;
                let yPos = _y + y * lineSpacingY;

                let sizeNoise = noise(xPos * bgNS_X, yPos * bgNS_Y);

                let distRatio = dist(moonX, moonY, xPos, yPos) / min(width, height);
                let nowColor = NYLerpColor(fromColor, toColor, distRatio);
                let randomizedColor = nowColor.getRandomColor(4, 4, 4);
                randomizedColor.a = 0.8;
                // randomizedColor.applyStroke();
                noStroke();
                randomizedColor.applyFill();

                push();
                translate(xPos, yPos);

                strokeWeight(lineThickness * sizeNoise);
                circle(0, 0, circleRadius);
                pop();
            }
        }
    }
}

function NYRectBGLine(_x, _y, _width, _height, _colorA, _colorB) {

    let thickness = random(2, 12);
    let xCount = _width / thickness;
    let yCount = floor(random(8, 128));
    let ySpacing = _height / yCount;

    // draw vertical lines
    for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
            let xPos = _x + x * thickness;
            let yPos = _y + y * ySpacing;

            let distRatio = dist(moonX, moonY, xPos, yPos) / max(width, height);
            let nowColor = NYLerpColor(_colorA, _colorB, distRatio);
            let randomizedColor = nowColor.getRandomColor(30, 3, 6);
            if (random() < 0.06)
                randomizedColor.h = processHue(randomizedColor.h + 180);

            randomizedColor.a = 0.8;
            randomizedColor.applyStroke();

            push();
            translate(xPos, yPos);
            strokeWeight(thickness);
            // let lengthNoise = noise(xPos * 3, yPos * 0.001);
            // let drawLength = lerp(1.0, 1.4, lengthNoise) * ySpacing;
            drawLength = ySpacing;
            line(0, -0.5 * drawLength, 0, 0.5 * drawLength);
            pop();
        }
    }

}

async function drawFrame() {
    let frameNoiseScale = 0.01;
    let thickness = 0.003 * min(width, height);

    // draw up
    for (let x = 0; x < width; x++) {
        let x1 = x;
        let y1 = 0;

        let x2 = x;
        let y2 = thickness;

        let sizeNoise = noise(x * frameNoiseScale, y2 * frameNoiseScale);

        y2 = lerp(1.0, 1.4, sizeNoise) * thickness;

        strokeWeight(2);
        line(x1, y1, x2, y2);
    }

    // draw bot
    for (let x = 0; x < width; x++) {
        let x1 = x;
        let y1 = height;

        let x2 = x;
        let y2 = height - thickness;

        let sizeNoise = noise(x * frameNoiseScale, y2 * frameNoiseScale);

        y2 = height - lerp(1.0, 1.4, sizeNoise) * thickness;

        strokeWeight(2);
        line(x1, y1, x2, y2);
    }

    // draw left
    for (let y = 0; y < height; y++) {
        let x1 = 0;
        let y1 = y;

        let x2 = thickness;
        let y2 = y;

        let sizeNoise = noise(x2 * frameNoiseScale, y * frameNoiseScale);

        x2 = lerp(1.0, 1.4, sizeNoise) * thickness;

        strokeWeight(2);
        line(x1, y1, x2, y2);    
    }

    // draw right
    for (let y = 0; y < height; y++) {
        let x1 = width;
        let y1 = y;

        let x2 = width - thickness;
        let y2 = y;

        let sizeNoise = noise(x2 * frameNoiseScale, y * frameNoiseScale);

        x2 = width - lerp(1.0, 1.4, sizeNoise) * thickness;

        strokeWeight(2);
        line(x1, y1, x2, y2);    
    }
}

// draw stick according to the drawRoom params
function drawStick(_x, _y, _width, _height, _colorA, _colorB) {
    let stickPosX = _x + random(0.1, 0.9) * _width;
    let stickPosY = _y;

    let stickColor = NYLerpColor(_colorA, _colorB, random(0, 1));
    stickColor.s = random(30, 100);
    stickColor.b = random(6, 24);

    let stickRot = random(-20, 20);
    if (random() < 0.1)
        stickRot = random(-40, 40);

    let stickHeight = random(10, 60);

    return NYStick(stickPosX, stickPosY, random(3, 8), stickHeight, stickRot, stickColor)
}

function NYStick(_x, _y, _width, _height, _angle, _color) {

    let lineCount = floor(_height * lineDensity);

    let poleNodes = [];
    let nodePos = random(0.5, 1.0);
    let nodeDrawn = false;

    for (let i = 0; i < lineCount; i++) {
        let t = i / (lineCount - 1);

        let xPos = _x + sin(radians(_angle)) * _height * t;
        let yPos = _y - cos(radians(_angle)) * _height * t;

        let widthNoise = noise(xPos * 0.1, yPos * 0.1, 666);
        let nowWidth = widthNoise * _width * (1 - t) + 1;

        // draw
        _color.applyStroke();
        strokeWeight(random(1, 2));


        // add nodes
        if (!nodeDrawn && t >= nodePos) {
            nodeDrawn = true;

            let outWidth = _width * random(3, 6);

            let x1 = xPos + sin(radians(_angle - 90)) * outWidth * 0.5;
            let y1 = yPos - cos(radians(_angle - 90)) * outWidth * 0.5;

            let x2 = xPos + sin(radians(_angle + 90)) * outWidth * 0.5;
            let y2 = yPos - cos(radians(_angle + 90)) * outWidth * 0.5;

            let nodePosRatioA = 0.05;
            let nodePosRatioB = 0.95;

            let nodeAX = lerp(x1, x2, nodePosRatioA);
            let nodeAY = lerp(y1, y2, nodePosRatioA);

            let nodeBX = lerp(x1, x2, nodePosRatioB);
            let nodeBY = lerp(y1, y2, nodePosRatioB);


            poleNodes.push(new NYNode(nodeAX, nodeAY));
            poleNodes.push(new NYNode(nodeBX, nodeBY));


            line(x1, y1, x2, y2);
        }
        // simply draw style
        else if (random() < 0.1) {
            let outWidth = nowWidth * random(3, 6);

            let x1 = xPos + sin(radians(_angle - 90)) * outWidth * 0.5;
            let y1 = yPos - cos(radians(_angle - 90)) * outWidth * 0.5;

            let x2 = xPos + sin(radians(_angle + 90)) * outWidth * 0.5;
            let y2 = yPos - cos(radians(_angle + 90)) * outWidth * 0.5;

            line(x1, y1, x2, y2);
        }
        else {
            let x1 = xPos + sin(radians(_angle - 90)) * nowWidth * 0.5;
            let y1 = yPos - cos(radians(_angle - 90)) * nowWidth * 0.5;

            let x2 = xPos + sin(radians(_angle + 90)) * nowWidth * 0.5;
            let y2 = yPos - cos(radians(_angle + 90)) * nowWidth * 0.5;


            line(x1, y1, x2, y2);
        }
    }

    return poleNodes;
}

function NYRandomColor(_hueOffset = 0) {

    let resultHue = mainHue + _hueOffset + random(-30, 30);
    let resultSat = baseSat + random(-30, 30);
    let resultBri = baseBri + random(-30, 30);

    if (random() < 0.06) {
        resultSat = 0;
        resultBri = 100;
    }

    resultHue = processHue(resultHue);

    return new NYColor(resultHue, resultSat, resultBri);
}

function NYLerpColor(_colorA, _colorB, _t) {
    let hueA = _colorA.h;
    let hueB = _colorB.h;

    let hueDiff = abs(hueB - hueA);

    if (abs((hueB - 360) - hueA) < hueDiff) {
        hueB -= 360;
    }
    else if (abs((hueB + 360) - hueA) < hueDiff) {
        hueB += 360;
    }

    let satA = _colorA.s;
    let briA = _colorA.b;
    let alphaA = _colorA.a;

    let satB = _colorB.s;
    let briB = _colorB.b;
    let alphaB = _colorB.a;

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

    return new NYColor(resultHue, resultSat, resultBri, resultAlpha);
}

function processHue(_hue) {
    let result = _hue % 360;
    if (result < 0) {
        result += 360;
    }
    return result;
}

