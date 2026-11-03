let SHOW_PATH = true;
let SHOW_CIRCLES = true;

// get circles on the path
async function getCircleQueue(_pathPoints, _minSize = 10, _maxSize = 60) {

    let resultCircles = [];

    let pathIndex = 0;
    let lastPoint = _pathPoints[0];
    let nextPoint = _pathPoints[1];

    // prepare next circle
    let lastCircleSize = random(_minSize, _maxSize);
    let nextCircleSize = random(_minSize, _maxSize);
    let maxDist = lastCircleSize + nextCircleSize;
    let minDist = max(lastCircleSize, nextCircleSize);
    let nextCircleDist = lerp(minDist, maxDist, random(0.1, 0.9));

    // add in first circle
    let nowX = _pathPoints[0].x;
    let nowY = _pathPoints[0].y;

    let fromX = _pathPoints[0].x;
    let fromY = _pathPoints[0].y;

    let toX = _pathPoints[1].x;
    let toY = _pathPoints[1].y;

    let pathSteps = max(1, floor(dist(nowX, nowY, toX, toY)));
    let nowSteps = 0;
    let nowT = 0.0;

    if (SHOW_CIRCLES) {
        stroke(random(0, 360), 40, 100);
        noFill();
        circle(nowX, nowY, lastCircleSize * 2);
    }
    resultCircles.push(new CircleData(_pathPoints[0].x, _pathPoints[0].y, lastCircleSize));

    let lastCircleX = nowX;
    let lastCircleY = nowY;

    let counter = 0;

    // walk and get circles
    while (true) {
        nowT = nowSteps / pathSteps;
        nowX = lerp(fromX, toX, nowT);
        nowY = lerp(fromY, toY, nowT);

        if (SHOW_PATH) {
            noStroke();
            fill('blue');
            circle(nowX, nowY, 2);
        }

        let distToLastCircle = dist(nowX, nowY, lastCircleX, lastCircleY);
        let distToNextPathPoint = dist(nowX, nowY, nextPoint.x, nextPoint.y);

        // arrive dest circle point
        if (distToLastCircle >= nextCircleDist) {
            if (SHOW_CIRCLES) {
                stroke(random(0, 360), 40, 100);
                noFill();
                circle(nowX, nowY, nextCircleSize * 2);
            }
            resultCircles.push(new CircleData(nowX, nowY, nextCircleSize));

            lastCircleX = nowX;
            lastCircleY = nowY;

            // get next circle
            lastCircleSize = nextCircleSize;
            nextCircleSize = random(_minSize, _maxSize);

            maxDist = lastCircleSize + nextCircleSize;
            minDist = max(lastCircleSize, nextCircleSize);
            nextCircleDist = lerp(minDist, maxDist, random(0.1, 0.9));
        }

        // arrive next path point
        if (nowSteps >= pathSteps) {

            // if it is the last point
            if (pathIndex == _pathPoints.length - 1) {
                // console.log("LASTT!!");
                // console.log(`pathIndex: ${pathIndex}, _pathPoints.length: ${_pathPoints.length}`);

                // add last circle
                let walkDir = getAngle(lastCircleX, lastCircleY, toX, toY) + 90;
                // console.log(`fromX: ${fromX}, fromY: ${fromY}, toX: ${toX}, toY: ${toY}`);
                // console.log("circleDir: " + walkDir);

                let endCircleX = lastCircleX + sin(radians(walkDir)) * nextCircleDist;
                let endCircleY = lastCircleY - cos(radians(walkDir)) * nextCircleDist;

                if (SHOW_CIRCLES) {
                    stroke(random(0, 360), 40, 100);
                    noFill();
                    circle(endCircleX, endCircleY, nextCircleSize);
                }
                resultCircles.push(new CircleData(endCircleX, endCircleY, nextCircleSize));
                break;
            }

            lastPoint = _pathPoints[pathIndex];

            pathIndex++;

            nextPoint = _pathPoints[pathIndex];
            fromX = toX;
            fromY = toY;
            toX = nextPoint.x;
            toY = nextPoint.y;
            nowSteps = 0;
            pathSteps = max(1, floor(dist(fromX, fromY, toX, toY)));
        }

        counter++;
        nowSteps++;

        if (counter % 100 == 0)
            await sleep(1);
    }

    return resultCircles;
}

// get the path on the circles
async function getCircleWalkPath(_circles, _walkSpeed = 1) {

    // draw on the edge of circles
    let nowCircleIndex = 0;
    let nowWalkingAngle = -90;
    let endWalkingAngle = _circles[nowCircleIndex].getIntersectionAngle(_circles[nowCircleIndex + 1])[0];
    let angleStep = _walkSpeed;
    let walkX = _circles[nowCircleIndex].x + sin(radians(nowWalkingAngle)) * _circles[nowCircleIndex].radius;
    let walkY = _circles[nowCircleIndex].y - cos(radians(nowWalkingAngle)) * _circles[nowCircleIndex].radius;

    let resultPathData = [];
    let counter = 0;

    while (true) {

        if (SHOW_PATH) {
            fill('white');
            noStroke();
            circle(walkX, walkY, 6);
        }

        resultPathData.push({ x: walkX, y: walkY });
        // NoisePoint(walkX, walkY);

        nowWalkingAngle += angleStep;

        let walkPoint = _circles[nowCircleIndex].getSurfacePoint(nowWalkingAngle);
        walkX = walkPoint.x;
        walkY = walkPoint.y;

        // walk on next cirlce
        if (nowWalkingAngle >= endWalkingAngle) {

            // console.log(`${nowCircleIndex} ${_circles.length}`);
            nowCircleIndex++;

            if (nowCircleIndex == _circles.length - 1) {
                nowWalkingAngle = _circles[nowCircleIndex].getPointAngle(walkX, walkY);

                if (nowWalkingAngle > 180)
                    nowWalkingAngle -= 360;

                endWalkingAngle = 90;
            }
            else if (nowCircleIndex == _circles.length) {
                break;
            }
            else {

                nowWalkingAngle = _circles[nowCircleIndex].getPointAngle(walkX, walkY);

                // make the nowAngle in 0~360 range
                if (nowWalkingAngle > 360)
                    nowWalkingAngle -= 360;
                else if (nowWalkingAngle < 0)
                    nowWalkingAngle += 360;

                endWalkingAngle = _circles[nowCircleIndex].getIntersectionAngle(_circles[nowCircleIndex + 1])[0];

                if (endWalkingAngle < nowWalkingAngle)
                    endWalkingAngle += 360;
            }
        }

        if (counter++ % 100 == 0)
            await sleep(1);
    }

    return resultPathData;
}


async function getNoisePath(_x1, _y1, _x2, _y2, _noiseScale, _wavingHeight) {
    let walkDir = getAngle(_x1, _y1, _x2, _y2) + 90;
    let walkCount = dist(_x1, _y1, _x2, _y2);

    let pathPoints = [];

    for (let i = 0; i < walkCount; i++) {
        let nowX = lerp(_x1, _x2, i / walkCount);
        let nowY = lerp(_y1, _y2, i / walkCount);

        let noiseValue = (noise(nowX * _noiseScale, nowY * _noiseScale) - 0.5) * 2;
        let wavingHeight = _wavingHeight * noiseValue;

        let wavingDir = walkDir + 90;
        let wavingX = nowX + sin(radians(wavingDir)) * wavingHeight - 0.5 * wavingHeight;
        let wavingY = nowY - cos(radians(wavingDir)) * wavingHeight - 0.5 * wavingHeight;

        if (SHOW_PATH) {
            fill('white');
            noStroke();
            circle(wavingX, wavingY, 2);
        }
        pathPoints.push({ x: wavingX, y: wavingY });

        if (i % 100 == 0)
            await sleep(1);
    }

    return pathPoints;
}