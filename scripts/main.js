var workspace = d3.select('#workspace')
        .append('svg')
            .attr({
                'width' : '100%',
                'height': '100%'
            }),

    $workspace = $(workspace.node()),

    i = 0,
    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow');


$('#add-arrow').on('click', function () {
    elementCollection['arrow' + i] = new Arrow(workspace); // needs options
    i += 1;
    $arrowControls.show();
});
