class RectData {
    constructor(_x, _y, _w, _h) {
        this.x = _x;
        this.y = _y;
        this.w = _w;
        this.h = _h;
    }
}

let DIVIDE_CHANCE = 0.8;
let MAX_DEPTH = 3;

function subdivideRect(_x, _y, _w, _h, _depth) {
    let isSplit = random() < DIVIDE_CHANCE;

    if (_depth >= MAX_DEPTH)
        isSplit = false;

    if (isSplit) {
        let splitRatio = random(0.2, 0.8);
        let isSplitLeftRight = (_w > _h);

        // split left right
        if (isSplitLeftRight) {
            let rectAs = subdivideRect(_x, _y, _w * splitRatio, _h, _depth + 1);
            let rectBs = subdivideRect(_x + _w * splitRatio, _y, _w * (1 - splitRatio), _h, _depth + 1);
            return rectAs.concat(rectBs);
        }
        // split top bottom
        else {
            let rectAs = subdivideRect(_x, _y, _w, _h * splitRatio, _depth + 1);
            let rectBs = subdivideRect(_x, _y + _h * splitRatio, _w, _h * (1 - splitRatio), _depth + 1);
            return rectAs.concat(rectBs);
        }
    }
    else {
        return [new RectData(_x, _y, _w, _h)];
    }

}