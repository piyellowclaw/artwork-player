let nodeDensity = 0.03;
let dotDensity = 0.16;

let wireType = 2;
let wireColor;

class NYNode {
    constructor(_x, _y) {
        this.x = _x;
        this.y = _y;

        this.lastNode = null;
        this.nextNode = null;
    }
}

class Connection {
    constructor(_nodeA, _nodeB) {
        this.nodeA = _nodeA;
        this.nodeB = _nodeB;
    }

    drawLinear() {
        line(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y);
    }

    drawCurve(_offsetAmount) {
        let dotCount = dist(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y) * dotDensity;

        for (let i = 0; i < dotCount; i++) {
            let t = i / (dotCount - 1);

            let nowX = lerp(this.nodeA.x, this.nodeB.x, i / dotCount);
            let nowY = lerp(this.nodeA.y, this.nodeB.y, i / dotCount);

            nowY += sin(radians(t * 180)) * _offsetAmount;
            fill(wireColor);

            if (wireType == 0) {
                let dotSize = 3;
                circle(nowX, nowY, dotSize);
            }
            else if (wireType == 1) {
                circle(nowX, nowY, 1.2);
            }
            else if (wireType == 2) {
                let sizeNoise = noise(nowX * 0.3, nowY * 0.3);
                let dotSize = lerp(-1, 3, sizeNoise);
                circle(nowX, nowY, dotSize);
            }

        }
        // console.log(`nodeA: ${this.nodeA.x}, ${this.nodeA.y} nodeB: ${this.nodeB.x}, ${this.nodeB.y}`);
    }
}

class NYBlock {
    constructor(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;

        this.colorA;
        this.colorB;

        this.nodes = [];
    }

    createNodes(count = -1) {
        let nodeCount = count;
        if (nodeCount == -1) {
            let blockSize = sqrt(this.w * this.h);
            nodeCount = blockSize * nodeDensity;
            nodeCount = floor(random(0.6, 1.4) * nodeCount);
        }

        for (let i = 0; i < nodeCount; i++) {
            let nodeX = this.x + random(0.1, 0.9) * this.w;
            let nodeY = this.y + random(0.1, 0.9) * this.h;

            this.nodes.push(new NYNode(nodeX, nodeY));
        }
    }

    drawRoomAndGetNodes() {

        this.nodes = NYRoom(this.x, this.y, this.w, this.h, this.colorA, this.colorB);
    }
}

class NYColor {
    constructor(_h, _s, _b, _a = 1.0) {
        this.h = _h;
        this.s = _s;
        this.b = _b;
        this.a = _a;
    }

    applyStroke() {
        stroke(this.h, this.s, this.b, this.a);
    }

    applyFill() {
        fill(this.h, this.s, this.b, this.a);
    }

    getRandomColor(_hRange, _sRange, _bRange) {
        let h = this.h + random(-_hRange, _hRange);
        let s = this.s + random(-_sRange, _sRange);
        let b = this.b + random(-_bRange, _bRange);

        h = processHue(h);

        return new NYColor(h, s, b, this.a);
    }

    getP5Color() {
        return color(this.h, this.s, this.b);
    }
}