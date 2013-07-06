/**
 * The Arrow element.
 *
 * @todo Should be broken out into a path animation. The arrow head is merely the item to animate,
 *       and the path could have options for how it animates/is displayed.
 *
 * @param  {object} workspace d3 svg element
 * @return {Arrow}
 */
var Arrow = function (workspace) {

    var pointsData = [],

        animationSpeed = 2,

        idIncrement = $('.arrow-path').length,

        prefix = 'arrow-',

        thisId = prefix + idIncrement,

        wrapper = workspace.append('g')
                .attr('id', thisId)
                .attr('class', 'arrow-wrapper'),

        arrowContainer = wrapper.append('g')
                .classed('arrow-container', true),

        $arrowContainer = $(arrowContainer.node()),

        path,
        pathLength,
        arrowHead,

        pointsContainer = wrapper.append('g')
                            .attr('class', 'arrow-points-container'),

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
        onDragPoint = function (d, i) {

            var target = d3.select(this);

            d.x += d3.event.dx;
            d.y += d3.event.dy;

            target.attr({
                'cx': d.x,
                'cy': d.y
            });

            redrawArrow(target);
        },

        pointDrag = d3.behavior.drag().on('drag', onDragPoint),

        addArrowButton = $('#draw-arrow'),

        deleteArrow = function () {
            path.remove();
            arrowHead.remove();
        },

        redrawArrow = function () {
            deleteArrow();
            drawArrow();
        },

        addPoint = function (x, y) {
            pointsData.push({'x': x, 'y': y});
            bindPoints();
        },

        animatePath = function (duration) {
            var dashArrayValue = pathLength + ',' + pathLength;

            path
                .attr({
                    'stroke-dasharray' : dashArrayValue,
                    'stroke-dashoffset': pathLength
                })
                .transition()
                    .duration(duration)
                    .ease('linear')
                    .attr('stroke-dashoffset', 0);
        },

        animateArrow = function () {
            var duration = animationSpeed * pathLength;
            animatePath(duration);
            animateArrowHead(duration);
        },

        drawPath = function () {
            path = arrowContainer.append('path')
                        .attr({
                            'd'     : lineAccessor(pointsData),
                            'class' : 'arrow-path'
                        });

            pathLength = path.node().getTotalLength();

            // store it for later!
            elementCollection[thisId] = {
                'element': path,
                'length' : pathLength
            };
        },

        animateArrowHead = function (duration) {
            var tween = Utils.createPathFollowTween(path);

            arrowHead.transition()
                // transition setters
                .duration(duration)
                .ease('linear')
                .attrTween('transform', tween);
        },

        positionArrowHead = function (position) {
            var position = getArrowHeadPosition(path),
                translate = [position.endPoint.x, position.endPoint.y];

            arrowHead.attr(
                'transform', 'translate(' + translate + ')' +
                             'rotate(' + position.angle + ')'
            );
        },

        getArrowHeadPosition = function (path) {
            var pathNode   = path.node(),
                pathLength = pathNode.getTotalLength(),
                endPoint   = pathNode.getPointAtLength(pathLength),
                angle      = Utils.getRotation(pathNode.getPointAtLength(pathLength - 1), endPoint);

            return {
                'endPoint': endPoint,
                'angle': angle
            };
        },

        drawArrowHead = function () {
            var size     = 20, // size of the path head
                halfSize = size * 0.5,

                // triangle info
                arrowHeadShapeData = 'M 0 -' + halfSize + ' ' +
                            'l '   + size     + ' ' + halfSize + ' ' +
                            'l -'  + size     + ' ' + halfSize + ' z';

            // add the triangle graphic for the arrow head
            arrowHead = arrowContainer.append('path')
                            .attr({
                                'd'    : arrowHeadShapeData,
                                'class': 'arrowHead'
                            });
        },

        onClickWorkspace = function (e) {
            var parentOffset = $(e.target).parent().offset(),
                    // offset -> method allows you to retrieve the current position of an
                    // element 'relative' to the document.
                    x = (e.offsetX - parentOffset.left),
                    y = (e.offsetY - parentOffset.top);

            addPoint(x, y);
        },

        drawArrow = function () {
            drawPath();
            drawArrowHead();
            positionArrowHead();
        },

        onClickAddArrow = function () {
            drawArrow();
            animateArrow();
            unbindUI();
        },

        bindPoints = function () {
            var binding = pointsContainer.selectAll('.point').data(pointsData);

            binding.enter()
                .append('circle')
                    .attr({
                        'cx'        : function (d) {return d.x;},
                        'cy'        : function (d) {return d.y;},
                        'r'         : 15,
                        'class'     : 'draggable point'
                    })
                    .call(pointDrag);

            binding.exit().remove();
        },

        unbindUI = function () {
            $workspace.off('click', onClickWorkspace);
            addArrowButton.off('click', onClickAddArrow);

            $arrowControls.hide();
        },

        bindUI = function () {
            $workspace.on('click', onClickWorkspace);
            addArrowButton.on('click', onClickAddArrow);

            bindPoints();
        };

    bindUI();

    return {
        'animation': {
            'start': function () {
                animateArrow();
            }
        },
        'node': wrapper.node()
    };
};
