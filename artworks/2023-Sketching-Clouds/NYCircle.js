class CircleData {
    constructor(_x, _y, _radius) {
        this.x = _x;
        this.y = _y;
        this.radius = _radius;
    }

    isOnEdge(_x, _y) {
        let distToCenter = dist(_x, _y, this.x, this.y);
        return abs(distToCenter - this.radius) < 0.5;
    }

    getSurfacePoint(_angle) {
        let xPos = this.x + sin(radians(_angle)) * this.radius;
        let yPos = this.y - cos(radians(_angle)) * this.radius;

        return { x: xPos, y: yPos };
    }

    distToCenter(_x, _y) {
        return dist(_x, _y, this.x, this.y);
    }

    getPointAngle(_x, _y) {
        let angleToCenter = getAngle(this.x, this.y, _x, _y);
        return angleToCenter + 90;
    }

    // math from Lulu's blog:
    // https://lucidar.me/en/mathematics/how-to-calculate-the-intersection-points-of-two-circles/#calculating-a-and-b
    getIntersectionAngle(_circle) {
        let r1 = this.radius;
        let r2 = _circle.radius;
        let d = dist(this.x, this.y, _circle.x, _circle.y);

        let a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
        let b = (r2 * r2 - r1 * r1 + d * d) / (2 * d);

        let h = sqrt(r1 * r1 - a * a);

        let intersectPointSlope = degrees(atan2(h, a));
        let forwardAngle = getAngle(this.x, this.y, _circle.x, _circle.y) + 90;

        return [forwardAngle - intersectPointSlope, forwardAngle + intersectPointSlope];
    }

    getIntersectionPoint(_circle) {
        let intersectionDegree = this.getIntersectionAngle(_circle);
        let intersectX = this.x + sin(radians(intersectionDegree)) * this.radius;
        let intersectY = this.y - cos(radians(intersectionDegree)) * this.radius;
        return { x: intersectX, y: intersectY };
    }
}

// calculate degree
function getAngle(_x1, _y1, _x2 = null, _y2 = null) {

    if (_x2 == null && _y2 == null) // the first two parameters are point
    {
        let p1x = _x1.x;
        let p1y = _x1.y;

        let p2x = _y1.x;
        let p2y = _y1.y;

        let xDiff = p2x - p1x;
        let yDiff = p2y - p1y;

        let degree = atan2(yDiff, xDiff) * 180 / PI;

        return degree;
    }
    else {
        let xDiff = _x2 - _x1;
        let yDiff = _y2 - _y1;

        let degree = atan2(yDiff, xDiff) * 180 / PI;

        return degree;

    }
}