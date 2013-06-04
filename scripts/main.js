var workspace = d3.select('#workspace')
        .append('svg')
            .attr('width' , '100%')
            .attr('height', '100%'),

    $workspace = $(workspace.node()),

    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow'),

    getRotation = function (p1, p2) {
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


$('#add-arrow').on('click', function () {
    var newArrow = new Arrow(workspace); // needs options
    $arrowControls.show();
});
