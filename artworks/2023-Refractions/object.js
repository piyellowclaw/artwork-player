
let DOT_DENSITY = 0.6;

class RefractionObj {
    constructor(_x, _y, _width, _height, _rotation) {
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;
        this.rotation = _rotation;
        this.color = NYColor.newRandomColor(_mainHue);
    }

    //  0 ---- 1
    //  |      |
    //  3 ---- 2

    getCornerPoints() {
        let conerPoint_UL = rotatePoint(-0.5 * this.width, -0.5 * this.height, this.rotation);
        conerPoint_UL.x += this.x;
        conerPoint_UL.y += this.y;

        let conerPoint_UR = rotatePoint(0.5 * this.width, -0.5 * this.height, this.rotation);
        conerPoint_UR.x += this.x;
        conerPoint_UR.y += this.y;

        let conerPoint_DR = rotatePoint(0.5 * this.width, 0.5 * this.height, this.rotation);
        conerPoint_DR.x += this.x;
        conerPoint_DR.y += this.y;

        let conerPoint_DL = rotatePoint(-0.5 * this.width, 0.5 * this.height, this.rotation);
        conerPoint_DL.x += this.x;
        conerPoint_DL.y += this.y;

        return [conerPoint_UL, conerPoint_UR, conerPoint_DR, conerPoint_DL];
    }

    getLines() {
        let points = this.getCornerPoints();
        let lineUp = { 'x1': points[0].x, 'y1': points[0].y, 'x2': points[1].x, 'y2': points[1].y };
        let lineRight = { 'x1': points[1].x, 'y1': points[1].y, 'x2': points[2].x, 'y2': points[2].y };
        let lineBot = { 'x1': points[2].x, 'y1': points[2].y, 'x2': points[3].x, 'y2': points[3].y };
        let lineLeft = { 'x1': points[3].x, 'y1': points[3].y, 'x2': points[0].x, 'y2': points[0].y };

        return [lineUp, lineRight, lineBot, lineLeft];
    }

    drawPoints() {
        let points = this.getLines();
        for (let i = 0; i < points.length; i++) {
            circle(points[i].x, points[i].y, 10);
        }
    }

    draw() {
        strokeWeight(1);
        let dotColor = this.color.copy();
        let dotCount = this.width * this.height * DOT_DENSITY;

        push();
        translate(this.x, this.y);
        rotate(radians(this.rotation));

        for (let i = 0; i < dotCount; i++) {
            let nowH = processHue(dotColor.h + random(-20, 20));
            let nowS = dotColor.s + random(-20, 20);
            let nowB = dotColor.b + random(-20, 20);

            stroke(nowH, nowS, nowB, dotColor.a);

            let xRatio = random(random(random()));
            let yRatio = random(random(random()));

            if (random() < 0.5)
                xRatio = 1.0 - xRatio;

            if (random() < 0.5)
                yRatio = 1.0 - yRatio;

            let xPos = - 0.5 * this.width + this.width * xRatio;
            let yPos = - 0.5 * this.height + this.height * yRatio;

            point(xPos, yPos);
        }

        blendMode(ADD);
        noFill();
        rect(- 0.5 * this.width, - 0.5 * this.height, this.width, this.height);
        blendMode(BLEND);
        // rect(- 0.5 * this.width, - 0.5 * this.height, this.width, this.height);
        pop();
    }
}

class Beam {
    constructor(_x, _y, _angle, _color) {
        this.x = _x;
        this.y = _y;
        this.angle = _angle;
        this.color = _color;
    }

    draw() {
        let beamLength = max(width, height) * 2;
        let x2 = this.x + beamLength * sin(radians(this.angle));
        let y2 = this.y - beamLength * cos(radians(this.angle));

        colorMode(HSB);
        stroke(this.color.h, this.color.s, this.color.b, 1.0);
        // stroke('red');
        // strokeWeight(1);
        drawLaserLine(this.x, this.y, x2, y2);
        // console.log(`draw beam: ${this.x}, ${this.y}, ${x2}, ${y2}`);
        // line(int(this.x), int(this.y), int(x2), int(y2));
    }
}

class IntersectionData {
    constructor(_x, _y, _lineData) {
        this.x = _x;
        this.y = _y;
        this.line = _lineData;
    }
}

class LineData {
    constructor(_x1, _y1, _x2, _y2) {
        this.x1 = _x1;
        this.y1 = _y1;
        this.x2 = _x2;
        this.y2 = _y2;
    }

    draw() {
        drawLaserLine(this.x1, this.y1, this.x2, this.y2);
    }
}

class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    copy() {
        return new NYColor(this.h, this.s, this.b, this.a);
    }

    slightRandomize(_hDiff = 10, _sDiff = 12, _bDiff = 12, _aDiff = 0.0) {
        this.h += random(-0.5 * _hDiff, 0.5 * _hDiff);
        this.s += random(-0.5 * _sDiff, 0.5 * _sDiff);
        this.b += random(-0.5 * _bDiff, 0.5 * _bDiff);
        this.a += random(-0.5 * _aDiff, 0.5 * _aDiff);

        this.h = processHue(this.h);
    }

    color() {
        return color(this.h, this.s, this.b, this.a);
    }

    toRgb() {
        return  hsbToRgb(this.h, this.s, this.b);
    }

    static newRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-30, 30));
        let s = random(40, 80);
        let b = random(60, 100);

        // if (random() < 0.2)
        //     h = processHue(h + 180);

        // if (random() < 0.06) {
        //     s = random(0);
        //     b = random(80, 100);
        // }

        return new NYColor(h, s, b);
    }
}


