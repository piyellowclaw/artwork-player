let BEAM_DOT_DENSITY = 12.0;
let BEAM_SPREAD_RANGE = 0.1;
let BEAM_THICKNESS = 1.0;

function drawLaserLine (_x1, _y1, _x2, _y2) {

    let dotCount = dist(_x1, _y1, _x2, _y2) * BEAM_DOT_DENSITY;

    strokeWeight(0.8);
    for(let i=0; i< dotCount; i++)
    {
        let posT = random(0, 1);
        let baseX = lerp(_x1, _x2, posT);
        let baseY = lerp(_y1, _y2, posT);

        let angle = random(0, 360);
        let radius = (tan(random(TWO_PI))) * BEAM_SPREAD_RANGE;

        baseX += sin(radians(angle)) * radius;
        baseY += -cos(radians(angle)) * radius;

        point(baseX, baseY);
    }
}