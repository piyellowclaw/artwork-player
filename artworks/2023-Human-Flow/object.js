
class Human {
    constructor(_x, _y, _rotSet, _size = 1.0) {
        this.x = _x;
        this.y = _y;
        this.size = _size;

        this.nodes = [];

        this.hipsX = _rotSet.hipsX;
        this.hipsY = _rotSet.hipsY;

        this.hips = new BodyNode(0, 0, 80, _rotSet.hips, 30, 40, null);
        this.spine = new BodyNode(0, 0, 60, _rotSet.spine, 50, 60, this.hips);
        this.chest = new BodyNode(0, 0, 40, _rotSet.chest, 60, 40, this.spine);
        this.neck = new BodyNode(0, 0, 30, _rotSet.neck, 12, 10, this.chest);
        this.head = new BodyNode(0, 0, 80, _rotSet.head, 25, 40, this.neck);
        this.headEnd = new BodyNode(0, 0, 30, 0, 40, 30, this.head);

        this.leftShoulder = new BodyNode(20, 20, 40, _rotSet.leftShoulder + 120, 20, 20, this.chest);
        this.leftUpArm = new BodyNode(0, 0, 100, _rotSet.leftUpArm + 60, 20, 20, this.leftShoulder);
        this.leftForeArm = new BodyNode(0, 0, 120, _rotSet.leftForeArm, 25, 10, this.leftUpArm);
        this.leftHand = new BodyNode(0, 0, 30, _rotSet.leftHand, 15, 20, this.leftForeArm);
        this.leftHandEnd = new BodyNode(0, 0, 20, 0, 20, 10, this.leftHand);

        this.rightShoulder = new BodyNode(-20, 30, 40, _rotSet.rightShoulder - 120, 20, 20, this.chest);
        this.rightUpArm = new BodyNode(0, 0, 100, _rotSet.rightUpArm - 60, 20, 20, this.rightShoulder);
        this.rightForeArm = new BodyNode(0, 0, 120, _rotSet.rightForeArm, 25, 10, this.rightUpArm);
        this.rightHand = new BodyNode(0, 0, 30, _rotSet.rightHand, 15, 20, this.rightForeArm);
        this.rightHandEnd = new BodyNode(0, 0, 20, 0, 20, 10, this.rightHand);

        this.leftHip = new BodyNode(20, 0, 40, _rotSet.leftHip + 175, 30, 40, null);
        this.leftUpLeg = new BodyNode(0, 0, 120, _rotSet.leftUpLeg + 5, 36, 25, this.leftHip);
        this.leftForeLeg = new BodyNode(0, 0, 160, _rotSet.leftForeLeg, 25, 10, this.leftUpLeg);
        this.leftFoot = new BodyNode(0, 0, 20, _rotSet.leftFoot - 80, 15, 20, this.leftForeLeg);
        this.leftFootEnd = new BodyNode(0, 0, 40, 0, 20, 10, this.leftFoot);

        this.rightHip = new BodyNode(- 20, 0, 40, _rotSet.rightHip - 175, 30, 40, null);
        this.rightUpLeg = new BodyNode(0, 0, 120, _rotSet.rightUpLeg - 5, 36, 25, this.rightHip);
        this.rightForeLeg = new BodyNode(0, 0, 160, _rotSet.rightForeLeg, 25, 10, this.rightUpLeg);
        this.rightFoot = new BodyNode(0, 0, 20, _rotSet.rightFoot - 70, 15, 20, this.rightForeLeg);
        this.rightFootEnd = new BodyNode(0, 0, 40, 0, 20, 10, this.rightFoot);


        this.nodes.push(this.leftShoulder);
        this.nodes.push(this.leftUpArm);
        this.nodes.push(this.leftForeArm);
        this.nodes.push(this.leftHand);
        this.nodes.push(this.leftHandEnd);

        this.nodes.push(this.leftHip);
        this.nodes.push(this.leftUpLeg);
        this.nodes.push(this.leftForeLeg);
        this.nodes.push(this.leftFoot);
        this.nodes.push(this.leftFootEnd);

        this.nodes.push(this.hips);
        this.nodes.push(this.spine);
        this.nodes.push(this.chest);
        this.nodes.push(this.neck);
        this.nodes.push(this.head);
        this.nodes.push(this.headEnd);

        this.nodes.push(this.rightHip);
        this.nodes.push(this.rightUpLeg);
        this.nodes.push(this.rightForeLeg);
        this.nodes.push(this.rightFoot);
        this.nodes.push(this.rightFootEnd);

        this.nodes.push(this.rightShoulder);
        this.nodes.push(this.rightUpArm);
        this.nodes.push(this.rightForeArm);
        this.nodes.push(this.rightHand);
        this.nodes.push(this.rightHandEnd);
    }

    drawAll() {
        push();
        translate(this.x, this.y);
        scale(this.size);

        translate(this.hipsX, this.hipsY);
        for (let i = 0; i < this.nodes.length; i++) {

            this.nodes[i].drawNode();
        }
        pop();
    }
}

class BodyNode {
    constructor(_x, _y, _length, _angle, _fromThickness, _toThickness, _parent = null) {
        this.x = _x;
        this.y = _y;
        this.length = _length;
        this.angle = _angle;
        this.fromThickness = _fromThickness;
        this.toThickness = _toThickness;
        this.parent = _parent;

        if (this.parent != null) {
            let startPos = this.parent.getEndPos();
            this.x = startPos.x + _x;
            this.y = startPos.y + _y;

            this.angle += this.parent.angle;
        }
    }

    getEndPos() {
        let endX = this.x + this.length * sin(radians(this.angle));
        let endY = this.y + this.length * -cos(radians(this.angle));

        return { x: endX, y: endY };
    }

    drawNode() {
        let fromColor = nowFillColorA;
        let toColor = nowFillColorB;

        drawSketchLine(this.x, this.y, this.angle, this.length, this.fromThickness, this.toThickness, fromColor, toColor);
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

    static newRandomColor(_mainHue) {
        let h = processHue(_mainHue + random(-80, 80));
        let s = random(40, 100);
        let b = random(60, 100);

        return new NYColor(h, s, b);
    }
}


