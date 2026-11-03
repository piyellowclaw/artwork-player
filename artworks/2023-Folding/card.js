class Card {
    constructor(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;

        this.offsetX = random(-10, 10);
        this.offsetY = random(-10, 10);
        this.offsetRot = random(-10, 10);

        this.backOffsetX = _x;
        this.backOffsetY = _y;
        this.backRotation = 0;

        this.isFlip = random() < 0.5;
        this.cropType = int(random(0, 3));

        this.frontRemovePoints = [];

        this.seed = random(-100000, 100000);

        this.cardHue = 0;
        this.cardSat = 0;
        this.cardBri = 0;
    }

    // put card graphic on temp graphic
    getCardGraphic() {
        // for now just use imge
        _currentCardFront.resizeCanvas(this.w, this.h);
        _currentCardBack.resizeCanvas(this.w, this.h);

        _currentCardFront.noStroke();
        _currentCardBack.noStroke();

        _currentCardFront.image(_cardFrontGraphic, -this.x, -this.y);
        _currentCardBack.image(_cardBackGraphic, -this.x, -this.y);
    }

    cropCard(_ratioA, _ratioB) {
        // crop left right
        if (this.cropType == 0) {
            let leftPoint = new Point(0, this.h * _ratioA);
            let rightPoint = new Point(this.w, this.h * _ratioB);

            let frontCropPoints = [
                new Point(0, 0),
                new Point(this.w, 0),
                rightPoint,
                leftPoint
            ];

            let backCropPoints = [
                leftPoint,
                rightPoint,
                new Point(this.w, this.h),
                new Point(0, this.h)
            ];

            if (this.isFlip) {
                let temp = backCropPoints;
                backCropPoints = frontCropPoints;
                frontCropPoints = temp;
            }

            // save for the animation
            this.frontRemovePoints = Array.from(frontCropPoints);

            _currentCardFront.erase();
            _currentCardFront.beginShape();
            for (let i = 0; i < frontCropPoints.length; i++)
                _currentCardFront.vertex(frontCropPoints[i].x, frontCropPoints[i].y);
            _currentCardFront.endShape(CLOSE);
            _currentCardFront.noErase();

            _currentCardBack.erase();
            _currentCardBack.beginShape();
            for (let i = 0; i < backCropPoints.length; i++)
                _currentCardBack.vertex(backCropPoints[i].x, backCropPoints[i].y);
            _currentCardBack.endShape(CLOSE);
            _currentCardBack.noErase();

            // calculate back pos and angle
            let angle = getAngleDegreeFromTop(rightPoint, leftPoint);
            let angleDiff = angle - 180;
            let finalAngle = angle + angleDiff;
            this.backRotation = finalAngle;

            let centerPoint = new Point(0.5 * this.w, 0.5 * this.h);
            let mirrorPoint = getMirrorPoint(leftPoint, rightPoint, centerPoint);
            this.backOffsetX = mirrorPoint.x;
            this.backOffsetY = mirrorPoint.y;
        }

        // crop top bottom
        if (this.cropType == 1) {
            let topPoint = new Point(this.w * _ratioA, 0);
            let botPoint = new Point(this.w * _ratioB, this.h);

            let frontCropPoints = [
                new Point(0, 0),
                topPoint,
                botPoint,
                new Point(0, this.h)
            ];

            let backCropPoints = [
                topPoint,
                new Point(this.w, 0),
                new Point(this.w, this.h),
                botPoint
            ];

            if (this.isFlip) {
                let temp = backCropPoints;
                backCropPoints = frontCropPoints;
                frontCropPoints = temp;
            }

            // save for the animation
            this.frontRemovePoints = Array.from(frontCropPoints);

            _currentCardFront.erase();
            _currentCardFront.beginShape();
            for (let i = 0; i < frontCropPoints.length; i++)
                _currentCardFront.vertex(frontCropPoints[i].x, frontCropPoints[i].y);
            _currentCardFront.endShape(CLOSE);
            _currentCardFront.noErase();

            _currentCardBack.erase();
            _currentCardBack.beginShape();
            for (let i = 0; i < backCropPoints.length; i++)
                _currentCardBack.vertex(backCropPoints[i].x, backCropPoints[i].y);
            _currentCardBack.endShape(CLOSE);
            _currentCardBack.noErase();

            // calculate back pos and angle
            let angle = getAngleDegreeFromTop(topPoint, botPoint);
            let angleDiff = angle - 180;
            let finalAngle = angle + angleDiff;
            this.backRotation = finalAngle;

            let centerPoint = new Point(0.5 * this.w, 0.5 * this.h);
            let mirrorPoint = getMirrorPoint(topPoint, botPoint, centerPoint);
            this.backOffsetX = mirrorPoint.x;
            this.backOffsetY = mirrorPoint.y;
        }

        // corner left top
        if (this.cropType == 2) {
            let cornerType = int(random(0, 4));

            let pointA;
            let pointB;
            let frontCropPoints = [];
            let backCropPoints = [];

            // left top
            if (cornerType == 0) {
                pointA = new Point(0, this.h * _ratioA);
                pointB = new Point(this.w * _ratioB, 0);

                frontCropPoints = [
                    new Point(0, 0),
                    pointA,
                    pointB
                ];

                backCropPoints = [
                    pointA,
                    new Point(0, this.h),
                    new Point(this.w, this.h),
                    new Point(this.w, 0),
                    pointB
                ];
            }
            // right top
            else if (cornerType == 1) {
                pointA = new Point(this.w * _ratioA, 0);
                pointB = new Point(this.w, this.h * _ratioB);

                frontCropPoints = [
                    pointA,
                    new Point(this.w, 0),
                    pointB
                ];

                backCropPoints = [
                    new Point(0, 0),
                    pointA,
                    pointB,
                    new Point(this.w, this.h),
                    new Point(0, this.h)
                ];
            }
            // left bot
            else if (cornerType == 2) {
                pointA = new Point(0, this.h * _ratioA);
                pointB = new Point(this.w * _ratioB, this.h);

                frontCropPoints = [
                    pointA,
                    pointB,
                    new Point(0, this.h)
                ];

                backCropPoints = [
                    new Point(0, 0),
                    new Point(this.w, 0),
                    new Point(this.w, this.h),
                    pointB,
                    pointA
                ];
            }
            // right bot
            else if (cornerType == 3) {
                pointA = new Point(this.w * _ratioA, this.h);
                pointB = new Point(this.w, this.h * _ratioB);

                frontCropPoints = [
                    pointA,
                    new Point(this.w, this.h),
                    pointB
                ];

                backCropPoints = [
                    new Point(0, 0),
                    new Point(this.w, 0),
                    pointB,
                    pointA,
                    new Point(0, this.h)
                ];
            }

            // save for the animation
            this.frontRemovePoints = Array.from(frontCropPoints);

            _currentCardFront.erase();
            _currentCardFront.beginShape();
            for (let i = 0; i < frontCropPoints.length; i++)
                _currentCardFront.vertex(frontCropPoints[i].x, frontCropPoints[i].y);
            _currentCardFront.endShape(CLOSE);
            _currentCardFront.noErase();

            _currentCardBack.erase();
            _currentCardBack.beginShape();
            for (let i = 0; i < backCropPoints.length; i++)
                _currentCardBack.vertex(backCropPoints[i].x, backCropPoints[i].y);
            _currentCardBack.endShape(CLOSE);
            _currentCardBack.noErase();

            // calculate back pos and angle
            let angle = getAngleDegreeFromTop(pointA, pointB);
            let angleDiff = angle - 180;
            let finalAngle = angle + angleDiff;
            this.backRotation = finalAngle;

            let centerPoint = new Point(0.5 * this.w, 0.5 * this.h);
            let mirrorPoint = getMirrorPoint(pointA, pointB, centerPoint);
            this.backOffsetX = mirrorPoint.x;
            this.backOffsetY = mirrorPoint.y;
        }
    }

    drawFront() {
        _frontLayer.push();
        _frontLayer.translate(this.x + 0.5 * this.w, this.y + 0.5 * this.h);

        _frontLayer.image(_currentCardFront, -0.5 * this.w, -0.5 * this.h);
        _frontLayer.pop();
    }

    removeCroppedFront() {
        _frontLayer.push();
        _frontLayer.translate(this.x, this.y);

        _frontLayer.erase();
        _frontLayer.beginShape();
        for (let i = 0; i < this.frontRemovePoints.length; i++)
            _frontLayer.vertex(this.frontRemovePoints[i].x, this.frontRemovePoints[i].y);
        _frontLayer.endShape(CLOSE);
        _frontLayer.noErase();

        _frontLayer.pop();
    }

    drawBack() {
        _backLayer.push();
        _backLayer.translate(this.x + this.backOffsetX, this.y + this.backOffsetY);
        _backLayer.rotate(radians(this.backRotation));
        _backLayer.scale(1, -1);
        _backLayer.image(_currentCardBack, -0.5 * this.w, -0.5 * this.h);
        _backLayer.pop();
    }
}

class RectData {
    constructor(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;
    }
}

class Point {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
}

class ColorData {
    constructor(_hue, _sat, _bri, _alpha = 1.0) {
        this.h = _hue;
        this.s = _sat;
        this.b = _bri;
        this.a = _alpha;
    }
}