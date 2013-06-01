Raphael('holder', 640, 480, function () {
    var raphael = this,

        path = raphael.path('M400 200 C 200 300, 760 500, 200 300')
                    .attr({
                        'stroke'      : '#666666',
                        'opacity'     : 0.3,
                        'stroke-width': 2
                    }),

        triangle = raphael.path('M 0 0 L 20 10 L 0 20 z')
                    .attr({
                        'fill': '#666'
                    }),

        len = path.getTotalLength(),

        onTick = function () {
            triangle.attr({along: 0});
            setTimeout(run);
        };


    raphael.customAttributes.along = function (v) {
        var point = path.getPointAtLength(v * len);
        return {
            transform: 't' + [point.x, point.y] + 'raphael' + point.alpha
        };
    };

    triangle.attr({
        along: 0
    });

    function run() {
        triangle.animate({along: 1}, 5000, onTick);
    }
    run();
});
