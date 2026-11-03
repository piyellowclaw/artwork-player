class NYShape {
    constructor(_points) {
        this.points = _points;
    }

    draw(_applyPerspective = false) {

        beginShape();
        for (let i = 0; i < this.points.length; i++) {
            let tempPoint = this.points[i].copy();

            if (_applyPerspective)
                tempPoint.applyPerspective();

            vertex(tempPoint.x, tempPoint.y);
        }

        endShape(CLOSE);
    }

}


// this Point 0,0 is in the center
class Point {

    constructor(_x = 0, _y = 0) {
        this.x = _x;
        this.y = _y;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    applyPerspective() {
        let x = this.x;
        let y = this.y;

        this.x += (y - 0.5 * height) * 0.6;
        this.y += (x - 0.5 * width) * -0.2;
    }

    applyTall(_tall) {
        this.y -= _tall;
    }
}

function lerpPoint(_p1, _p2, _t) {
    let x = lerp(_p1.x, _p2.x, _t);
    let y = lerp(_p1.y, _p2.y, _t);

    return new Point(x, y);
}

class ColorSetting {
    constructor() {
        this.strokeHue = 0;
        this.strokeSat = 0;
        this.strokeBri = 0;

        this.strokeWeight = 1;

        this.fillHue = 0;
        this.fillSat = 0;
        this.fillBri = 0;
    }

    copy() {
        let newColorSetting = new ColorSetting();
        newColorSetting.strokeHue = this.strokeHue;
        newColorSetting.strokeSat = this.strokeSat;
        newColorSetting.strokeBri = this.strokeBri;
        newColorSetting.strokeWeight = this.strokeWeight;
        newColorSetting.fillHue = this.fillHue;
        newColorSetting.fillSat = this.fillSat;
        newColorSetting.fillBri = this.fillBri;

        return newColorSetting;
    }

    fillColor(_hue, _sat, _bri) {
        this.fillHue = _hue;
        this.fillSat = _sat;
        this.fillBri = _bri;
    }

    strokeColor(_hue, _sat, _bri) {
        this.strokeHue = _hue;
        this.strokeSat = _sat;
        this.strokeBri = _bri;
    }

    randomStroke(_mainHue = 0) {
        this.strokeHue = _mainHue + random(-30, 30);
        this.strokeSat = random(40, 60);
        this.strokeBri = random(20, 40);
    }

    randomFill(_mainHue = 0) {
        this.fillHue = processHue(_mainHue + random(-30, 30));
        this.fillSat = random(40, 60);
        this.fillBri = random(80, 100);
    }

    apply() {
        strokeWeight(this.strokeWeight);
        stroke(this.strokeHue, this.strokeSat, this.strokeBri);
        fill(processHue(this.fillHue + random(-10, 10)), this.fillSat + random(-10, 10), this.fillBri + random(-10, 10));

        if (random() < 0.06)
            fill('white');
    }
}

function processHue(_hue) {
    if (_hue > 360)
        _hue -= 360;
    else if (_hue < 0)
        _hue += 360;

    return _hue;
}