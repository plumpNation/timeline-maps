/*jslint browser:true */
/*global $, d3, TweenMax, Linear, Utils */
/**
 * The Arrow element.
 *
 * @todo Should be broken out into a path animation. The arrow head is merely the item to animate,
 *       and the path could have options for how it animates/is displayed.
 *
 * @param  {object} workspace d3 svg element
 * @return {Arrow}
 */
var Arrow = function (workspace, options) {
    'use strict';

    var pointsData = [],

        idIncrement = $('.arrow-path').length,

        prefix = 'arrow-',

        thisId = prefix + idIncrement,

        $workspace = $(workspace.node()),

        wrapper = workspace.append('g')
                .attr('id', thisId)
                .attr('class', 'arrow-wrapper'),

        arrowContainer = wrapper.append('g')
                .classed('arrow-container', true),

        $arrowContainer = $(arrowContainer.node()),

        path,
        pathLength,
        arrowHead,

        pointsContainer = wrapper.append('g').attr('class', 'arrow-points-container'),

        lineAccessor = d3.svg.line()
                        .x(function (d) { return d.x; })
                        .y(function (d) { return d.y; })
                        .interpolate('cardinal'),
                        //.tension(0.7),

        getArrowHeadPosition = function (length) {
            var pathNode   = path.node(),
                pathLength = pathNode.getTotalLength(),
                point      = pathNode.getPointAtLength(
                    (length !== undefined) ? length : pathLength
                ),
                prevLength = (length >= 1) ? pathLength - 1 : 0,
                angle      = Utils.getRotation(pathNode.getPointAtLength(prevLength), point);

            return {
                'point': point,
                'angle': angle
            };
        },

        /*positionArrowHead = function (length) {
            var position = getArrowHeadPosition(length),
                translate = [position.point.x, position.point.y];

            arrowHead.attr(
                'transform',
                'translate(' + translate + ')' +
                    'rotate(' + position.angle + ')'
            );
        },*/

        drawArrowHead = function () {
            var size     = 20, // size of the path head
                halfSize = size * 0.5,

                // triangle info
                arrowHeadShapeData = 'M 0 -' + halfSize + ' ' +
                            'l '   + size     + ' ' + halfSize + ' ' +
                            'l -'  + size     + ' ' + halfSize + ' z';

            // add the triangle graphic for the arrow head
            arrowHead = arrowContainer.append('g').attr('class', 'arrowHead');

            $(arrowHead.node()).css({
                'left': pointsData[0].x,
                'top': pointsData[0].y
            });

            arrowHead.append('path').attr('d', arrowHeadShapeData);
        },

        drawPath = function () {
            path = arrowContainer.append('path').attr({
                'd'     : lineAccessor(pointsData),
                'class' : 'arrow-path'
            });

            pathLength = path.node().getTotalLength();
        },

        drawArrow = function () {
            drawPath();
            drawArrowHead();
        },

        deleteArrow = function () {
            path.remove();
            arrowHead.remove();
        },

        redrawArrow = function () {
            deleteArrow();
            drawArrow();
        },

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

        getAnimationDuration = function () {
            return options.animationSpeed * pathLength;
        },

        animateArrowHead = function (duration) {
            var animPoints = _(pointsData).clone();

            console.log(BezierPlugin.bezierThrough(pointsData, 1, true));

            duration = duration * 0.001;

            TweenMax.to(
                arrowHead,
                duration,
                {
                    'bezier': {
                        // 'type': 'quadratic',
                        'autoRotate': true,
                        'values': pointsData,
                        'curviness': 0.7
                    },
                    'ease': Linear.easeNone
                }
            );
        },

        animateArrow = function () {
            var duration = getAnimationDuration();
            animatePath(duration);
            animateArrowHead(duration);
        },

        bindPoints = function () {
            var binding = pointsContainer.selectAll('.point').data(pointsData);

            binding.enter()
                .append('circle').attr({
                    'cx'        : function (d) { return d.x; },
                    'cy'        : function (d) { return d.y; },
                    'r'         : 15,
                    'class'     : 'draggable point'
                })
                .call(pointDrag);

            binding.exit().remove();
        },

        addPoint = function (x, y) {
            pointsData.push({'x': x, 'y': y});
            bindPoints();
        },

        onClickWorkspace = function (e) {
            var parentOffset = $(e.target).parent().offset(),
                // offset -> method allows you to retrieve the current position of an
                // element 'relative' to the document.
                x = (e.offsetX - parentOffset.left),
                y = (e.offsetY - parentOffset.top);

            addPoint(x, y);
        },

        unbindUI = function () {
            $workspace.off('click', onClickWorkspace);
            addArrowButton.off('click', onClickAddArrow);

            options.onDone();
        },

        onClickAddArrow = function () {
            drawArrow();
            animateArrow();
            unbindUI();
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
        'node': wrapper.node(),
    };
};
