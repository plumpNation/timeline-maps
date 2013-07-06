var workspace = d3.select('#workspace')
        .append('svg')
            .attr({
                'width' : '100%',
                'height': '100%'
            }),

    $workspace = $(workspace.node()),

    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow');


$('#add-arrow').on('click', function () {
    var newArrow = new Arrow(workspace); // needs options
    $arrowControls.show();
});
