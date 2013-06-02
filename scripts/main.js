var tempPlotPoints = [],
    elementCollection = {},

    prefix = 'curve-',

    tension = 0.7,

    idIncrement = 0,
    animationSpeed = 2000,

    svg = d3.select('#viz')
            .append('svg')
                .attr('width' , '100%')
                .attr('height', '100%'),

    dotsGroup = svg.append('g')
            .attr('id', 'dots'),

    curvesGroup = svg.append('g')
            .attr('id', 'curves'),

    followers = svg.append('g')
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
                        .tension(tension)
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
            'element'   : path,
            'length'    : pathLength,
            'plotPoints': tempPlotPoints
        };

        // clear plots
        tempPlotPoints = [];
        idIncrement   += 1;

        return path;
    },

    getPathData = function (path) {
        return elementCollection[path.attr('id')];
    },

    /**
     * On greensock animation frame/tick, the tweenData is adapted and applied to the
     * follower object/element.
     *
     * @param  {object} tweenData The object being animated
     * @param  {d3 object} follower  [description]
     * @return {void}
     */
    updateFollower = function (tweenData, follower) {
        var xyPos = 'translate(' + tweenData.x + ',' + tweenData.y + ')',
            rotation = 'rotate(' + tweenData.rotation + ')';

        follower.attr('transform', xyPos + ' ' + rotation);
    },

    tween = function (tweenData, follower, duration) {
        // animationSpeed must be set in the parent/global scope
        duration = duration || animationSpeed;

        TweenMax.to(tweenData, (duration / 1000), {
            bezier: {
                type        : 'thru',
                prepend     : tweenData.startPoint,
                autoRotate  : true,
                values      : tweenData.points,
                curviness   : 0.8
            },

            onUpdate        : function () {
                updateFollower(tweenData, follower);
            },

            ease            : Linear.easeNone
        });
    },

    animateAlongPath = function (path, follower) {
        var points = getPathData(path).plotPoints,

            startPoint = {
                x: points[0].x,
                y: points[0].y
            },

            tweenData = {
                rotation    : 0,
                points      : points,
                startPoint  : startPoint,
                x           : startPoint.x,
                y           : startPoint.y
            };

        console.log(points);
        console.log(BezierPlugin.bezierThrough(points, tension, true));

        tween(tweenData, follower);
    },

    addFollowerToPath = function (path) {
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

        animateAlongPath(path, follower);
    };

$('svg').on('click', function (e) {
    var parentOffset = $(this).parent().offset(),
            // offset -> method allows you to retrieve the current position of an
            // element 'relative' to the document.
            x = e.pageX - parentOffset.left,
            y = e.pageY - parentOffset.top;

    storePoint(x, y);
});

$('#draw').on('click', function () {
    if (tempPlotPoints.length) {
        addFollowerToPath(drawCurve());
    }
});
