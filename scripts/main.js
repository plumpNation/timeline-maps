Raphael("holder", 640, 480, function () {
    var r = this,

        p = r.path("M400 200 C 200 300, 760 500, 200 300").attr({stroke: "#666", opacity: .3, "stroke-width": 2}),

        triangle = r.path("M 0 0 L 20 10 L 0 20 z").attr({'fill': "#666"}),

        len = p.getTotalLength();


    r.customAttributes.along = function (v) {
        var point = p.getPointAtLength(v * len);
        return {
            transform: "t" + [point.x, point.y] + "r" + point.alpha
        };
    };

    triangle.attr({along: 0});

    var rotateAlongThePath = true;

    function run() {
        triangle.animate({along: 1}, 5000, function () {
            triangle.attr({along: 0});
            setTimeout(run);
        });
    }
    run();
});
