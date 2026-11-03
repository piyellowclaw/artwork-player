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

function hsbToRgb(_hue, _sat, _bri) {

  // Ensure that the input values are within the valid range
  let inputHue = processHue(_hue);
  let inputSat = Math.max(0, Math.min(100, _sat));
  let inputBri = Math.max(0, Math.min(100, _bri));

  // Convert saturation and brightness to values between 0 and 1
  inputSat /= 100;
  inputBri /= 100;

  // Calculate the chroma (color intensity)
  const chroma = inputSat * inputBri;

  // Calculate the hue sector
  const hueSector = inputHue / 60;

  // Calculate intermediate values
  const x = chroma * (1 - Math.abs((hueSector % 2) - 1));
  const m = inputBri - chroma;

  let r, g, b;

  // Determine the RGB values based on the hue sector
  if (0 <= hueSector && hueSector < 1) {
    r = chroma;
    g = x;
    b = 0;
  } else if (1 <= hueSector && hueSector < 2) {
    r = x;
    g = chroma;
    b = 0;
  } else if (2 <= hueSector && hueSector < 3) {
    r = 0;
    g = chroma;
    b = x;
  } else if (3 <= hueSector && hueSector < 4) {
    r = 0;
    g = x;
    b = chroma;
  } else if (4 <= hueSector && hueSector < 5) {
    r = x;
    g = 0;
    b = chroma;
  } else {
    r = chroma;
    g = 0;
    b = x;
  }

  // Adjust the RGB values by adding the m (brightness minus chroma)
  r = (r + m) * 255;
  g = (g + m) * 255;
  b = (b + m) * 255;

  // Ensure the RGB values are within the valid range (0 - 255)
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

function processHue(_hue) {
  let result = (_hue % 360 + 360) % 360;
  return result;
}

function processAngleRange(_angle) {
  let result = (_angle % 360 + 360) % 360;
  return result;
}

// get angle between two points and return in degrees
function getAngle(_x1, _y1, _x2, _y2) {
  let xDiff = _x2 - _x1;
  let yDiff = _y2 - _y1;
  return atan2(yDiff, xDiff) * 180 / PI + 90;
}

// get the intersaction point of two lines
// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function getIntersectionPoint(x1, y1, x2, y2, x3, y3, x4, y4) {

  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

  return { x, y }
}

// source: https://matthew-brett.github.io/teaching/rotation_2d.html
function rotatePoint(_x, _y, _angle) {
  let x = _x * cos(radians(_angle)) - _y * sin(radians(_angle));
  let y = _x * sin(radians(_angle)) + _y * cos(radians(_angle));

  return { 'x': x, 'y': y };
}

function findTargetRefractor(_beam, _refractors) {
  
  let closestRefractor = null;
  let minDist = 1000;

  for(let i=0; i< _refractors.length; i++)
  {
    let resultDatas = getBeamRefractorIntersectionDatas(_beam, _refractors[i]);

    for(let j=0; j<resultDatas.length; j++)
    {
      let dataDist = dist(_beam.x, _beam.y, resultDatas[j].x, resultDatas[j].y);
      if (dataDist < minDist || closestRefractor == null) {
        if (dataDist <= 3.0)
          continue;

        closestRefractor = _refractors[i];
        minDist = dataDist;
      }
    }
  }

  return closestRefractor;
}

function getBeamRefractorIntersectionDatas(_beam, _refractor) {
  let beamLength = max(width, height) * 2;

  let x1 = _beam.x;
  let y1 = _beam.y;
  let x2 = _beam.x + beamLength * sin(radians(_beam.angle));
  let y2 = _beam.y - beamLength * cos(radians(_beam.angle));

  let refractorLines = _refractor.getLines();

  let resultDatas = [];

  for (let i = 0; i < refractorLines.length; i++) {
    let intersectionPoint = getIntersectionPoint(x1, y1, x2, y2, refractorLines[i].x1, refractorLines[i].y1, refractorLines[i].x2, refractorLines[i].y2);

    if (intersectionPoint != false) {
      let lineData = new LineData(refractorLines[i].x1, refractorLines[i].y1, refractorLines[i].x2, refractorLines[i].y2);

      let newData = new IntersectionData(intersectionPoint.x, intersectionPoint.y, lineData);
      resultDatas.push(newData);
    }
  }

  return resultDatas;
}

let resultCount = 0;
// check intersection point and calculate refract angle
// refract reference: https://www.omnicalculator.com/physics/angle-of-refraction
function getBeamRefractorResult(_beam, _refractor, _n1, _n2) {
  // console.log("COUNTER::: " + resultCount++);
  // console.log("nowN1: " + _n1);
  // console.log("nowN2: " + _n2);
  let intersectionDatas = getBeamRefractorIntersectionDatas(_beam, _refractor);

  if (intersectionDatas == false) {
    return false;
  }

  let closestData = null;
  let minDist = 1000;

  // find closest intersection point
  for (let i = 0; i < intersectionDatas.length; i++) {
    let dataDist = dist(_beam.x, _beam.y, intersectionDatas[i].x, intersectionDatas[i].y);
    if (dataDist < minDist || closestData == null) {
      if (dataDist <= 3.0)
        continue;

      closestData = intersectionDatas[i];
      minDist = dataDist;
    }
    // circle(intersectionDatas[i].x, intersectionDatas[i].y, 10);
  }

  if (closestData == null) {
    return false;
  }

  fill('orange');
  // circle(closestData.x, closestData.y, 10);

  let refractPoint = { x: closestData.x, y: closestData.y };

  let surfaceAngle = getAngle(closestData.line.x1, closestData.line.y1, closestData.line.x2, closestData.line.y2);
  // console.log("surface Angle: " + surfaceAngle);

  let normalA = processAngleRange(surfaceAngle + 90);
  let normalA_Beam = new Beam(refractPoint.x, refractPoint.y, normalA, new NYColor(60, 100, 100));
  // normalA_Beam.draw();
  // console.log("normalA: " + normalA);

  let normalB = processAngleRange(surfaceAngle - 90);
  let normalB_Beam = new Beam(refractPoint.x, refractPoint.y, normalB, new NYColor(120, 100, 100));
  // normalB_Beam.draw();
  // console.log("normalB: " + normalB);

  let normalA_theta = abs(normalA - _beam.angle);
  if (normalA_theta > 180)
    normalA_theta = 360 - normalA_theta;

  let normalB_theta = abs(normalB - _beam.angle);
  if (normalB_theta > 180)
    normalB_theta = 360 - normalB_theta;
  // console.log("normalA Diff: " + normalA_theta);
  // console.log("normalB Diff: " + normalB_theta);

  let targetNormal = 0.0;
  if (normalA_theta > normalB_theta)
    targetNormal = normalB;
  else
    targetNormal = normalA;

  // console.log("targetNormal: " + targetNormal);

  let theta1 = min(normalA_theta, normalB_theta);

  let n1 = _n1;
  let n2 = _n2;
  let calculateData = n1 * sin(radians(theta1)) / n2;
  // console.log("ratioData: " + calculateData);

  let resultAngle = 0.0;
  let newN1 = n1;
  let newN2 = n2;
  let isReflect = false;

  // becomes reflection
  if (calculateData > 1 || calculateData < -1) {
    resultAngle = targetNormal - 180 - (_beam.angle - targetNormal);
    isReflect = true;
  }
  // refract
  else {
    let theta2 = asin(n1 * sin(radians(theta1)) / n2);

    let angleDiff = _beam.angle - targetNormal;
    // console.log('angle diff1: ' + angleDiff);
    if (angleDiff > 180)
      angleDiff -= 360;
    else if (angleDiff < -180)
      angleDiff += 360;

    // console.log('angle diff: ' + angleDiff);

    if (angleDiff > 0)
      resultAngle = targetNormal + degrees(theta2);
    else
      resultAngle = targetNormal - degrees(theta2);

    newN1 = n2;
    newN2 = n1;
  }
  // console.log(resultAngle);

  return {
    'contactPoint': refractPoint,
    'newAngle': processAngleRange(resultAngle),
    'newN1': newN1,
    'newN2': newN2,
    'isReflect': isReflect
  }
}