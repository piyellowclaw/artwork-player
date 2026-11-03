function getRandomColorSet() {
    let sets = [];

    sets.push({
        waterColor: new NYColor(220, 40, 10),
        waterFlowColor: new NYColor(192, 86, 90),
        plantColorA: new NYColor(120, 60, 60),
        plantColorB: new NYColor(80, 60, 60),
        plantContrastColor: new NYColor(40, 70, 80),
        plantHighlightColor: new NYColor(0, 0, 100),
        flowerInsideColor: new NYColor(300, 20, 100, 0.8),
        flowerOutsideColor: new NYColor(0, 0, 100, 0.8),
        pistilColorA: new NYColor(52, 90, 95, 0.6),
        pistilColorB: new NYColor(326, 30, 90, 0.6)
    });

    sets.push({
        waterColor: new NYColor(0, 0, 100),
        waterFlowColor: new NYColor(60, 48, 90),
        plantColorA: new NYColor(294, 50, 100),
        plantColorB: new NYColor(334, 50, 100),
        plantContrastColor: new NYColor(60, 100, 100),
        plantHighlightColor: new NYColor(0, 0, 100),
        flowerInsideColor: new NYColor(244, 90, 40, 0.8),
        flowerOutsideColor: new NYColor(270, 20, 20, 0.8),
        pistilColorA: new NYColor(20, 0, 100, 0.6),
        pistilColorB: new NYColor(64, 87, 100, 0.6)
    });

    sets.push({
        waterColor: new NYColor(156, 10, 100),
        waterFlowColor: new NYColor(156, 100, 60),
        plantColorA: new NYColor(197, 66, 90),
        plantColorB: new NYColor(161, 66, 90),
        plantContrastColor: new NYColor(262, 85, 93),
        plantHighlightColor: new NYColor(0, 0, 100),
        flowerInsideColor: new NYColor(310, 94, 26, 0.8),
        flowerOutsideColor: new NYColor(229, 80, 80, 0.8),
        pistilColorA: new NYColor(120, 0, 100, 0.6),
        pistilColorB: new NYColor(146, 0, 100, 0.6)
    });

    sets.push({
        waterColor: new NYColor(297, 60, 20),
        waterFlowColor: new NYColor(340, 100, 100),
        plantColorA: new NYColor(330, 90, 90),
        plantColorB: new NYColor(300, 90, 90),
        plantContrastColor: new NYColor(220, 100, 100),
        plantHighlightColor: new NYColor(0, 0, 100),
        flowerInsideColor: new NYColor(24, 98, 100, 0.8),
        flowerOutsideColor: new NYColor(59, 62, 100, 0.8),
        pistilColorA: new NYColor(120, 0, 100, 0.6),
        pistilColorB: new NYColor(190, 100, 100, 0.6)
    });

    sets.push({
        waterColor: new NYColor(0, 100, 60),
        waterFlowColor: new NYColor(300, 60, 100),
        plantColorA: new NYColor(260, 30, 12),
        plantColorB: new NYColor(230, 30, 10),
        plantContrastColor: new NYColor(60, 100, 100),
        plantHighlightColor: new NYColor(0, 0, 0),
        flowerInsideColor: new NYColor(24, 98, 100, 0.8),
        flowerOutsideColor: new NYColor(0, 0, 100, 0.8),
        pistilColorA: new NYColor(180, 99, 100, 0.6),
        pistilColorB: new NYColor(220, 100, 100, 0.6)
    });

    sets.push({
        waterColor: new NYColor(0, 0, 3),
        waterFlowColor: new NYColor(0, 0, 10),
        plantColorA: new NYColor(0, 0, 20),
        plantColorB: new NYColor(0, 0, 20),
        plantContrastColor: new NYColor(60, 100, 100),
        plantHighlightColor: new NYColor(0, 0, 0),
        flowerInsideColor: new NYColor(0, 0, 30, 0.8),
        flowerOutsideColor: new NYColor(0, 0, 100, 0.8),
        pistilColorA: new NYColor(180, 99, 100, 0.6),
        pistilColorB: new NYColor(20, 100, 100, 0.6)
    });

    // return random(sets);
    return sets[5];
}