var Utils = (function () {
    var getRotation = function (p1, p2) {
        var deltaY,
            deltaX,
            degrees;

        if (!p1 || !p2) {
            return 0;
        }

        deltaY  = p2.y - p1.y;
        deltaX  = p2.x - p1.x;
        degrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        return degrees;
    };

    return {
        'getRotation': getRotation
    };
}());
