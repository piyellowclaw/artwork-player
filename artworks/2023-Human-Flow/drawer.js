let sketchDensity = 0.3;
let dotDensity = 0.8;

function drawSketchLine(_x, _y, _drawDir, _length, _fromWidth, _toWidth, _fromColor, _toColor) {
    let strokeCount = _length * sketchDensity;

    for (let i = 0; i < strokeCount; i++) {
        let t = i / (strokeCount - 1);

        let nowX = _x + _length * t * sin(radians(_drawDir));
        let nowY = _y + _length * t * -cos(radians(_drawDir));
        let nowThickness = lerp(_fromWidth, _toWidth, t);
        let nowColor = NYLerpColor(_fromColor, _toColor, t);
        nowColor.slightRandomize(60, 40, 40);
        nowColor.a = 0.6;
        

        noStroke();
       

        push();
        translate(nowX, nowY);
        rotate(radians(_drawDir + random(-pieceRotRandomness, pieceRotRandomness)));

        strokeWeight(1);
        stroke(0, 0, 6, 0.8);
        fill(nowColor.h, nowColor.s, nowColor.b, nowColor.a);
        ellipse(0, 0, nowThickness * 2, nowThickness * 2 * 0.3);


        // fill(nowColor.h, nowColor.s, nowColor.b, nowColor.a);
        // NYArc(0, 0, nowThickness, nowThickness * 0.3 * random(0.8, 1.2));

        pop();
    }
}

function NYArc(_x, _y, _width, _height) {
    let dotCount = PI * _width * dotDensity;

    for (let i = 0; i < dotCount; i++) {
        let t = i / (dotCount - 1);
        let curveT = 0;
        if (t < 0.5)
            curveT = easeOutCubic(t * 2);
        else
            curveT = easeOutCubic(1 - (t - 0.5) * 2);

        let nowThickness = lerp(-3, 3, curveT);
        if (nowThickness <= 0)
            continue;

        let angle = -90 + t * 360;

        let nowX = _x + _width * cos(radians(angle));
        let nowY = _y + _height * sin(radians(angle));

        circle(nowX, nowY, nowThickness);
    }

}