var tempPlotPoints = [],
    elementCollection = {},

    prefix = 'curve-',

    lastPoint,

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

    lineAccessor = d3.svg.line()
                    .x(function (d) { return d.x; })
                    .y(function (d) { return d.y; })
                    .interpolate('cardinal'),

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
    },

    translateAlong = function (path, follower) {
        var pathTotalLength = path.getTotalLength();

        /**
         * The tween function is invoked when the transition starts on each element, being passed
         * the current datum d, the current index i and the current attribute value a, with the this
         * context as the current DOM element. The return value of tween must be an interpolator: a
         * function that maps a parametric value t in the domain [0,1] to a color, number or arbitrary
         * value.
         *
         * @return {function}
         */
        return function tween (d, i, a) {
            // this is the onRenderTick for the path animation for a curve
            return function (time) {
                var point = path.getPointAtLength(time * pathTotalLength),
                    pointString = point.x + ',' + point.y,
                    rotation = getRotation(lastPoint || point, point);

                lastPoint = point;

                return 'translate(' + pointString + ') rotate(' + rotation + ')';
            };
        };
    },

    pathFollowTransition = function (path, follower, duration) {
        duration = duration || 2000;

        follower.transition()
            // transition setters
            .duration(duration)
            .ease('linear')
            .attrTween('transform', translateAlong(path.node(), follower));
    },

    addAnimatedCircleToPath = function (path) {
        var size        = 20, // size of the arrow head

            coords      = 'M 0 -' + (size * 0.5) + ' ' +
                          'l ' + size + ' ' + (size * 0.5) + ' ' +
                          'l -' + size + ' ' + (size * 0.5) + ' z',

            // create a group to contain the arrow head
            follower    = followers.append('g')
                            .attr('class', 'follower-container');

        // add the triangle graphpic for the arrow head
        follower.append('path')
                .attr('class', 'follower')
                .attr('d', coords)
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
