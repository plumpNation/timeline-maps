/*jslint browser:true, nomen:true */
/*global $, d3, Linear, Utils, BezierPlugin, timeline */
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

        curviness = 0.7,

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
        arrowHead,
        altArrowHead,

        pointsContainer = wrapper.append('g').attr('class', 'arrow-points-container'),

        getArrowHeadPosition = function (length) {
            var pathNode = path.node(),
                position,
                pointFrom,
                pointTo,
                prevLength,
                angle;

            if (length === undefined) {
                length = pathNode.getTotalLength();
            }

            position = pointTo = pathNode.getPointAtLength(length);

            if (length < 1) {
                prevLength = 0;
                length = 1;
                pointTo = pathNode.getPointAtLength(length);

            } else {
                prevLength = length - 1;
            }

            pointFrom = pathNode.getPointAtLength(prevLength);

            angle = Utils.getRotation(pointFrom, pointTo);

            return {
                'point': position,
                'angle': angle
            };
        },

        positionArrowHead = function (length) {
            var position = getArrowHeadPosition(length),
                matrix = Utils.createCssTransformMatrix(position.point, position.angle);

            arrowHead.attr('style', matrix);
        },

        drawAltArrowHead = function () {
            var position = getArrowHeadPosition(0);

            altArrowHead = $('<div>')
                .addClass('alt-arrow-head arrow-head')
                .css(
                    'transform',
                    'translate(' + [position.point.x + 'px', position.point.y + 'px'] + ')'
                )
                .prependTo(application);
        },

        drawArrowHead = function (_size) {
            var size     = _size || 20, // size of the path head
                halfSize = size * 0.5,

                // triangle info
                arrowHeadShapeData = 'M 0 -'    + halfSize + ' ' +
                            'l '   + size + ' ' + halfSize + ' ' +
                            'l -'  + size + ' ' + halfSize + ' z';

            arrowHead = arrowContainer.append('g').attr('class', 'arrow-head');

            // add the triangle graphic for the arrow head
            arrowHead.append('path').attr('d', arrowHeadShapeData);
        },

        drawPath = function () {
            // alt path
            path = workspace.append('path')
                            .attr('d', Utils.parseBezier(pointsData, curviness))
                            .attr('class', 'arrow-path');
        },

        drawArrow = function () {
            drawPath();
            // drawArrowHead();
            drawAltArrowHead();
        },

        deleteArrow = function () {
            if (path) {
                path.remove();
            }

            if (arrowHead) {
                arrowHead.remove();
            }

            if (altArrowHead) {
                altArrowHead.remove();
            }
        },

        /**
         * Drag handler, fires loads!
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

            path.attr('d', Utils.parseBezier(pointsData, curviness));
            // redrawArrowHead();
        },

        pointDrag = d3.behavior.drag().on('drag', onDragPoint),

        addArrowButton = $('#draw-arrow'),

        animatePath = function (duration, pathLength) {
            var dashArrayValue = pathLength + ',' + pathLength;

            path
                .attr({
                    'stroke-dasharray' : dashArrayValue,
                    'stroke-dashoffset': pathLength
                });

            /*timeline.to(path.node(), duration, {
                'attr': {'stroke-dashoffset': 0},
                ease: Linear.easeNone
            });*/
        },

        getAnimationDuration = function (pathLength) {
            return options.animationSpeed * pathLength;
        },

        animateAltHead = function (duration) {
            var speed = duration * 0.001,
                node = altArrowHead[0],
                tween;

            timeline.to(
                node,
                speed,
                {
                    'bezier': {
                        'values'    : pointsData,
                        'autoRotate': true,
                        'curviness' : curviness
                    },
                    'ease': Linear.easeNone
                }
            );
        },

        /*animateHead = function (duration) {
            var speed = duration * 0.001;

            timeline.to(
                arrowHead,
                speed,
                {
                    'bezier': {
                        // 'type': 'quadratic',
                        'autoRotate': true,
                        'values': pointsData,
                        'curviness': curviness
                    },
                    'ease': Linear.easeNone
                }
            );
        },*/

        animateArrow = function () {
            var pathLength = path.node().getTotalLength(),
                duration = getAnimationDuration(pathLength);

            // animatePath(duration, pathLength);
            animateAltHead(duration);

            timeline.play();
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
            // positionArrowHead(0);
            animateArrow();
            unbindUI();
        },

        bindUI = function () {
            $workspace.on('click', onClickWorkspace);
            addArrowButton.on('click', onClickAddArrow);

            bindPoints();

            $('body').on('mousedown', '.draggable', function (e) {
                console.log(e.target);
                $(e.target).one('mouseup', animateArrow)
            });
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
