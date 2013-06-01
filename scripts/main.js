var tempPlotPoints = [],
    elementCollection = {},

    prefix = 'curve-',

    idIncrement = 0,
    animationSpeed = 2000,

    sampleSVG = d3.select('#viz')
        .append('svg')
            .attr('width' , '100%')
            .attr('height', '100%'),

    dotsGroup = sampleSVG.append('g')
            .attr('id', 'dots'),

    curvesGroup = sampleSVG.append('g')
            .attr('id', 'curves'),

    followers = sampleSVG.append('g')
            .attr('id', 'followers'),

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
                        .x(function (d) { return d.x; })
                        .y(function (d) { return d.y; })
                        .interpolate('cardinal'),

    drawCurve = function () {
        var thisId = prefix + (idIncrement),

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
                .duration(animationSpeed)
                .ease('linear')
                .attr('stroke-dashoffset', 0);

        // store it for later!
        elementCollection[thisId] = {
            'element': path,
            'length' : pathLength
        };

        // clear plots
        tempPlotPoints = [];
        idIncrement   += 1;

        return path;
    },

    pathFollowTransition = function (path, follower, duration) {
        duration = duration || 2000;

        follower.transition()
            .duration(duration)
            .ease('linear')
            .attrTween('transform', translateAlong(path.node()));
    },

    translateAlong = function (path) {
        var pathTotalLength = path.getTotalLength();

        return function (d, i, a) {
            return function (time) {
                var point = path.getPointAtLength(time * pathTotalLength),
                    pointString = point.x + ',' + point.y;

                return 'translate(' + pointString + ')';
            };
        };
    },

    addAnimatedCircleToPath = function (path) {
        var follower = followers.append('circle')
                            .attr({
                                'r': 10
                            })
                            .style({
                                'fill': 'red'
                            });

        pathFollowTransition(path, follower, animationSpeed);
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
    addAnimatedCircleToPath(drawCurve());
});
