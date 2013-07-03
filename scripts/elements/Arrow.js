var Arrow = function (workspace) {

    var pointsData = [],

    animationSpeed = 2000,

    idIncrement = $('.arrow-path').length,

    arrowColor = 'red',

    prefix = 'arrow-',

    thisId = prefix + idIncrement,

    buildId = function (str) {
        return prefix + str + '-' + idIncrement;
    },

    container = workspace.append('g')
            .attr({
                'id': thisId,
                'class': 'element-container'
            });

    pathContainer = workspace.append('g')
            .attr('id', buildId('curve')),

    $pathContainer = $(pathContainer.node()),

    arrowHeadContainer = workspace.append('g')
            .attr('id', buildId('arrowHead')),

    dotsContainer = workspace.append('g')
            .attr('id', buildId('dots')),

    lineAccessor = d3.svg.line()
                    .x(function (d) { return d.x; })
                    .y(function (d) { return d.y; })
                    .interpolate('cardinal'),

    /**
     * Drag handler
     *
     * @param  {object} d Data, not used when creating points
     * @param  {number} i [description]
     * @return {void}
     */
    onDragPoint = function (data, i) {

        var target = d3.select(this),
            oldX = parseInt(target.attr('cx'), 10),
            oldY = parseInt(target.attr('cy'), 10),
            newX = oldX + d3.event.dx,
            newY = oldY + d3.event.dy

        target.attr({
            'cx': newX,
            'cy': newY
        });

        pointsData[target.attr('data-index')] = {'x': newX, 'y': newY};

        redrawPath(target);
    },

    pointDrag = d3.behavior.drag().on('drag', onDragPoint),

    addArrowButton = $('#draw-arrow'),

    /**
     * Redraws an arrow.
     * @return {void}
     */
    redrawPath = function () {
        $pathContainer.empty();
        drawPath();
    },

    addPoint = function (x, y) {
        var index = pointsData.push({'x': x, 'y': y}) - 1,
            k = dotsContainer.append('circle')
                .style({
                    'fill'        : 'rgba(0, 0, 0, 0.3)',
                    'stroke'      : 'grey',
                    'stroke-width': 1
                })
                .attr({
                    'cx'   : x,
                    'cy'   : y,
                    'r'    : 15,
                    'class': 'draggable',
                    'data-index': index
                })
                .call(pointDrag);
    },

    animatePath = function (path, animationSpeed) {
        var pathLength = path.node().getTotalLength(),
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
    },

    animateArrow = function (path, arrowHead) {
        animatePath(path, animationSpeed);
        animateArrowHead(path, arrowHead, animationSpeed);
    },

    drawPath = function () {
        var path = pathContainer.append('path')
                .attr({
                    'd': lineAccessor(pointsData),
                    'class': 'arrow-path'
                })
                .style({
                    'fill'            : 'none',
                    'stroke'          : 'red',
                    'stroke-width'    : 5
                }),

            pathLength = path.node().getTotalLength();

        // store it for later!
        elementCollection[thisId] = {
            'element': path,
            'length' : pathLength
        };

        return path;
    },

    translateAlong = function (path, arrowHead) {
        var pathNode = path.node(),
            pathTotalLength = pathNode.getTotalLength();

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
            var lastPoint;

            // this is the onRenderTick for the path animation for a curve
            return function (time) {
                var point = pathNode.getPointAtLength(time * pathTotalLength),
                    pointString = point.x + ',' + point.y,
                    rotation = getRotation(lastPoint || point, point);

                lastPoint = point;

                return 'translate(' + pointString + ') rotate(' + rotation + ')';
            };
        };
    },

    animateArrowHead = function (path, arrowHead, duration) {
        duration = duration || 2000;

        arrowHead.transition()
            // transition setters
            .duration(duration)
            .ease('linear')
            .attrTween('transform', translateAlong(path, arrowHead));
    },

    drawArrowHead = function (path) {
        var size = 20, // size of the path head
            halfSize = size * 0.5,

            pathNode = path.node(),

            // triangle info
            pathData = 'M 0 -' + halfSize + ' ' +
                        'l ' + size + ' ' + halfSize + ' ' +
                        'l -' + size + ' ' + halfSize + ' z',

            pathLength = pathNode.getTotalLength(),

            endPoint = pathNode.getPointAtLength(pathLength),

            angle = getRotation(pathNode.getPointAtLength(pathLength - 1), endPoint),

            // create a group to contain the path head
            arrowHead = arrowHeadContainer.append('g')
                            .attr({
                                'class': 'arrowHead-container',
                                'transform': 'translate(' + [endPoint.x, endPoint.y] + ')' +
                                             'rotate(' + angle + ')'
                             });

        // add the triangle graphic for the arrow head
        arrowHead.append('path')
            .attr({
                'd'        : pathData,
                'class'    : 'arrowHead', // combine these attrs
            })
            .style({
                'fill': arrowColor
            });

        return arrowHead;
    },

    onClickWorkspace = function (e) {
        var parentOffset = $(e.target).parent().offset(),
                // offset -> method allows you to retrieve the current position of an
                // element 'relative' to the document.
                x = (e.pageX - parentOffset.left),
                y = (e.pageY - parentOffset.top);

        addPoint(x, y);
    },

    onClickAddArrow = function () {
        var path = drawPath(),
            arrowHead = drawArrowHead(path);

        animateArrow(path, arrowHead);
        unbindUI();
    },

    unbindUI = function () {
        $workspace.off('click', onClickWorkspace);
        addArrowButton.off('click', onClickAddArrow);

        $arrowControls.hide();
    },

    bindUI = function () {
        $workspace.on('click', onClickWorkspace);
        addArrowButton.on('click', onClickAddArrow);
    };

    bindUI();
};
