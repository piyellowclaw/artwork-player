class PlantBowl {
    constructor(_x, _y, _width, _height) {
        this.bowlX = _x;
        this.bowlY = _y;
        this.bowlWidth = _width;
        this.bowlHeight = _height;

        this.bowlThickness = random(0.05, 0.2) * min(_width, _height);

        this.bowlType = 1; // 0: random rect bowl, 1: square bowl, 2: round bowl
        this.isPlantDrawn = false;

        if (random() < 0.06) {
            this.bowlType = 3; // empty bowl
            this.isPlantDrawn = true; // no need to draw
        }

        let minSide = min(_width, _height);
        this.paddingLeft = random(0, 0.2) * minSide;
        this.paddingRight = random(0, 0.2) * minSide;
        this.paddingTop = random(0, 0.2) * minSide;
        this.paddingBottom = random(0, 0.2) * minSide;

        // some chance that has no padding
        let paddingRandom = random();
        if (paddingRandom < 0.1) {
            this.paddingLeft = 0;
            this.paddingRight = 0;
            this.paddingTop = 0;
            this.paddingBottom = 0;
        }
        // some chance to have same padding
        else if (paddingRandom < 0.3) {
            this.paddingRight = this.paddingLeft;
            this.paddingTop = this.paddingLeft;
            this.paddingBottom = this.paddingLeft;
        }
        // some chance that is becomes square
        else if (paddingRandom < 0.8) {
            let newPadding = random(0.05, 0.1) * minSide;

            if (_width > _height) {
                this.paddingTop = newPadding;
                this.paddingBottom = newPadding;

                let spacePadding = _width - _height - 2 * newPadding;
                let spaceRatio = random();

                this.paddingLeft = newPadding + spacePadding * spaceRatio;
                this.paddingRight = newPadding + spacePadding * (1 - spaceRatio);
            }
            else {
                this.paddingLeft = newPadding;
                this.paddingRight = newPadding;

                let spacePadding = _height - _width - 2 * newPadding;
                let spaceRatio = random();

                this.paddingTop = newPadding + spacePadding * spaceRatio;
                this.paddingBottom = newPadding + spacePadding * (1 - spaceRatio);
            }

            if (random() < 0.5)
                this.bowlType = 2;
        }

        this.plantX = this.bowlX + this.paddingLeft + this.bowlThickness;
        this.plantY = this.bowlY + this.paddingTop + this.bowlThickness;
        this.plantWidth = this.bowlWidth - 2 * this.bowlThickness - this.paddingLeft - this.paddingRight;
        this.plantHeight = this.bowlHeight - 2 * this.bowlThickness - this.paddingTop - this.paddingBottom;

        if (this.bowlType <= 1)
            this.plantSize = random(0.3, 1.2) * min(this.plantWidth, this.plantHeight);
        else if (this.bowlType == 2)
            this.plantSize = random(0.3, 0.8) * min(this.plantWidth, this.plantHeight);
    }

    async drawBowlRect() {
        randomBowlColor();
        let bowlColorA = randomBowlColor();
        let bowlColorB = [];
        bowlColorB[0] = bowlColorA[0] + random(-10, 10);
        bowlColorB[1] = bowlColorA[1] + random(-10, 10);
        bowlColorB[2] = bowlColorA[2] + random(-20, 20);

        let thickness = random(0.03, 0.3) * min(this.bowlWidth, this.bowlHeight);
        let lineCount = thickness * lineDensity;

        let startX = this.bowlX + this.paddingLeft;
        let startY = this.bowlY + this.paddingTop;
        let startWidth = this.bowlWidth - this.paddingLeft - this.paddingRight;
        let startHeight = this.bowlHeight - this.paddingTop - this.paddingBottom;

        let endX = this.bowlX + this.paddingLeft + this.bowlThickness;
        let endY = this.bowlY + this.paddingTop + this.bowlThickness;
        let endWidth = this.bowlWidth - this.paddingLeft - this.paddingRight - this.bowlThickness * 2;
        let endHeight = this.bowlHeight - this.paddingTop - this.paddingBottom - this.bowlThickness * 2;

        for (let i = 0; i < lineCount; i++) {
            let t = i / (lineCount - 1);

            let nowX = lerp(startX, endX, t);
            let nowY = lerp(startY, endY, t);
            let nowWidth = lerp(startWidth, endWidth, t);
            let nowHeight = lerp(startHeight, endHeight, t);

            let bowlColorData = NYLerpColorData(bowlColorA, bowlColorB, t);
            NYSetColor(bowlColorData[0], bowlColorData[1], bowlColorData[2]);
            NYRectFrame(nowX, nowY, nowWidth, nowHeight);

            if (i % drawBowlLoopCount == 0)
                await sleep(1);
        }

        // fill with dirt
        // let dirtColorA = randomDirtColor();
        // let dirtColorB = randomDirtColor();

        // lineCount = endHeight * lineDensity;
        // for (let i = 0; i < lineCount; i++) {
        //     let t = i / (lineCount - 1);

        //     let nowX = endX;
        //     let nowY = endY + t * endHeight;

        //     let dirColorData = NYLerpColorData(dirtColorA, dirtColorB, t);
        //     NYSetColor(dirColorData[0], dirColorData[1], dirColorData[2]);
        //     NYLine(nowX, nowY, nowX + endWidth, nowY);
        // }
    }

    async drawBowlRound() {

        let drawWidth = this.bowlWidth - this.paddingLeft - this.paddingRight;
        let drawHeight = this.bowlHeight - this.paddingTop - this.paddingBottom;

        let drawX = this.bowlX + this.paddingLeft + drawWidth / 2;
        let drawY = this.bowlY + this.paddingTop + drawHeight / 2;

        let drawCount = this.bowlThickness * lineDensity;

        let bowlColorA = randomBowlColor();
        let bowlColorB = [];
        bowlColorB[0] = bowlColorA[0] + random(-10, 10);
        bowlColorB[1] = bowlColorA[1] + random(-10, 10);
        bowlColorB[2] = bowlColorA[2] + random(-20, 20);


        for (let i = 0; i < drawCount; i++) {
            let t = i / (drawCount - 1);
            let fromRadius = drawWidth / 2;
            let toRadius = drawWidth / 2 - this.bowlThickness;

            let bowlColorData = NYLerpColorData(bowlColorA, bowlColorB, t);
            NYSetColor(bowlColorData[0], bowlColorData[1], bowlColorData[2], 0.8);
            NYCircle(drawX, drawY, lerp(fromRadius, toRadius, t));

            if (i % drawBowlLoopCount == 0)
                await sleep(1);
        }
    }

    async drawPlant() {

        if (this.bowlType <= 1) // rectangle or square
        {
            let plantCount = 0;
            let sizeRatio = abs(this.plantWidth - this.plantHeight) / min(this.plantWidth, this.plantHeight);

            plantCount = floor(random(0.4, 1.3) * sizeRatio);
            if (plantCount <= 0)
                plantCount = 1;

            for (let i = 0; i < plantCount; i++) {
                let spawnX = this.plantX + random(0.1, 0.9) * this.plantWidth;
                let spawnY = this.plantY + random(0.1, 0.9) * this.plantHeight;

                let layers = floor(random(3, 12));
                let countPerLayer = floor(random(3, 24));

                await drawPlantB(spawnX, spawnY, this.plantSize, 0, layers, countPerLayer);
                // drawPlant(spawnX, spawnY, plantSize, plantSize * random(0.2, 0.7), random(0.1, 0.4) * plantSize, layers, countPerLayer);
            }
        }
        else if (this.bowlType == 2) {
            console.log("round bowl?");
            let spawnX = this.plantX + this.plantWidth / 2 + random(-0.2, 0.2) * this.plantWidth;
            let spawnY = this.plantY + this.plantHeight / 2 + random(-0.2, 0.2) * this.plantHeight;

            let layers = floor(random(3, 12));
            let countPerLayer = floor(random(3, 24));

            await drawPlantB(spawnX, spawnY, this.plantSize, 0, layers, countPerLayer);
        }

        this.isPlantDrawn = true;
    }
}

function NYCircle(_x, _y, _radius) {
    let circleLineLength = 2 * PI * _radius;
    let drawStrokeCount = circleLineLength * lineDensity * 0.4;

    for (let i = 0; i < drawStrokeCount; i++) {
        let t = i / drawStrokeCount;
        let nowX = _x + _radius * cos(t * 2 * PI);
        let nowY = _y + _radius * sin(t * 2 * PI);

        randomBrushColor(10, 10, 10);
        NYStrokePoint(nowX, nowY);
    }
}

function NYRectFrame(_x, _y, _width, _height) {
    NYLine(_x, _y, _x + _width, _y);
    NYLine(_x + _width, _y, _x + _width, _y + _height);
    NYLine(_x + _width, _y + _height, _x, _y + _height);
    NYLine(_x, _y + _height, _x, _y);
}