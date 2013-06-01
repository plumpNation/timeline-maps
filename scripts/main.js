var tempPlotPoints = [],
    elementCollection = {},

    prefix = 'curve-',

    idIncrement = 0,

    sampleSVG = d3.select('#viz')
        .append('svg')
            .attr('width' , '100%')
            .attr('height', '100%'),

    dotsGroup = sampleSVG.append('g')
            .attr('class', 'dots'),

    curvesGroup = sampleSVG.append('g')
            .attr('class', 'curves'),

    addDot = function (x, y) {
        dotsGroup.append('circle')
            .attr({
                'cx': x,
                'cy': y,
                'r' : 5
            })
            .style({
                'fill': 'none',
                'stroke': 'grey',
                'stroke-width': 1
            });
    },

    storePoint = function (x, y) {
        addDot(x, y);
        tempPlotPoints.push({'x': x, 'y': y});
    },

    lineAccessor = d3.svg.line()
                        .x(function(d) { return d.x; })
                        .y(function(d) { return d.y; })
                        .interpolate('cardinal'),

    drawCurve = function () {
        var thisId = prefix + (idIncrement++),

            path = curvesGroup.append('path')
                .attr({
                    'id': thisId,
                    'd': lineAccessor(tempPlotPoints)
                })
                .style({
                    'fill'            : 'none',
                    'stroke'          : 'red',
                    'stroke-width'    : 5
                }),

            pathLength = path.node().getTotalLength(),

            dashArrayValue = pathLength + ',' + pathLength;

        path
            .attr({
                'stroke-dasharray': dashArrayValue,
                'stroke-dashoffset': pathLength
            })
            .transition()
                .duration(2000)
                .ease('linear')
                .attr('stroke-dashoffset', 0);

        console.log(path);

        // store it for later!
        elementCollection[thisId] = {
            'element': path,
            'length' : pathLength
        };

        // clear plots
        tempPlotPoints = [];
    };

$('svg').on('click', function (e) {
    var parentOffset = $(this).parent().offset(),
            // offset -> method allows you to retrieve the current position of an
            // element 'relative' to the document.
            x = (e.pageX - parentOffset.left),
            y = (e.pageY - parentOffset.top);

    storePoint(x, y);
});

$('#draw').on('click', function () {
    drawCurve();
});
