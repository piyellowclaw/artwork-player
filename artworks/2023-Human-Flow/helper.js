function NYLerpHue(_hueA, _hueB, _t) {
  let hueA = _hueA;
  let hueB = _hueB;

  let hueDiff = abs(hueB - hueA);

  if (abs((hueB - 360) - hueA) < hueDiff) {
    hueB -= 360;
  }
  else if (abs((hueB + 360) - hueA) < hueDiff) {
    hueB += 360;
  }
  else {
    return lerp(_hueA, _hueB, _t);
  }

  let resultHue = lerp(hueA, hueB, _t);

  if (resultHue < 0) {
    resultHue += 360;
  }
  else if (resultHue > 360) {
    resultHue -= 360;
  }

  return resultHue;
}

function NYLerpColor(_colorA, _colorB, _t) {
  let _hue = NYLerpHue(_colorA.h, _colorB.h, _t);
  let _sat = lerp(_colorA.s, _colorB.s, _t);
  let _bri = lerp(_colorA.b, _colorB.b, _t);
  let _alpha = lerp(_colorA.a, _colorB.a, _t);

  return new NYColor(_hue, _sat, _bri, _alpha);
}

function NYLerpP5Color(_colorA, _colorB, _t) {
  let hueA = hue(_colorA);
  let hueB = hue(_colorB);

  let hueDiff = abs(hueB - hueA);

  if (abs((hueB - 360) - hueA) < hueDiff) {
    hueB -= 360;
  }
  else if (abs((hueB + 360) - hueA) < hueDiff) {
    hueB += 360;
  }
  else {
    return lerpColor(_colorA, _colorB, _t);
  }

  let satA = saturation(_colorA);
  let briA = brightness(_colorA);
  let alphaA = alpha(_colorA);

  let satB = saturation(_colorB);
  let briB = brightness(_colorB);
  let alphaB = alpha(_colorB);

  let resultHue = lerp(hueA, hueB, _t);
  let resultSat = lerp(satA, satB, _t);
  let resultBri = lerp(briA, briB, _t);
  let resultAlpha = lerp(alphaA, alphaB, _t);

  if (resultHue < 0) {
    resultHue += 360;
  }
  else if (resultHue > 360) {
    resultHue -= 360;
  }

  return color(resultHue, resultSat, resultBri, resultAlpha);
}

function processHue(_hue) {
  let result = _hue % 360;
  if (result < 0) {
    result += 360;
  }
  return result;
}

// get angle between two points and return in degrees
function getAngle(_x1, _y1, _x2, _y2) {
  let xDiff = _x2 - _x1;
  let yDiff = _y2 - _y1;
  return atan2(yDiff, xDiff) * 180 / PI + 90;
}