var workspace = d3.select('#workspace')
        .append('svg')
            .attr({
                'width' : '100%',
                'height': '100%'
            }),

    i = 0,

    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow');

$('#add-arrow').on('click', function () {
    elementCollection['arrow' + i] = new Arrow(workspace, {
        'onDone': function () {
            $arrowControls.hide();
        },
        'animationSpeed': 2
    }); // needs options

    $arrowControls.show();

    i += 1;
});
