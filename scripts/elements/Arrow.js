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

        bezierData,

        speed = options.speed || 1,

        curviness = options.curviness || 0.7,

        idIncrement = $('.arrow-path').length,

        prefix = 'arrow-',

        thisId = prefix + idIncrement,

        $workspace = $(workspace.node()),

        layer = workspace.append('div')
                        .attr('class', 'layer'),

        wrapper = layer.append('svg').append('g')
                .attr('id', thisId)
                .attr('class', 'arrow-wrapper'),

        arrowContainer = wrapper.append('g')
                .attr('class', 'arrow-container'),

        headContainer = layer.append('div').attr('class', 'arrow-head-container'),

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

        drawArrowHead = function () {
            var size     = options.headSize || 20, // size of the path head
                halfSize = size * 0.5,

                // triangle info
                arrowHeadShapeData = 'M 0 -'    + halfSize + ' ' +
                            'l '   + size + ' ' + halfSize + ' ' +
                            'l -'  + size + ' ' + halfSize + ' z',

                headSizePx = size + 'px';

            // add the triangle graphic for the arrow head
            arrowHead = headContainer.append('svg').append('path')
                .attr('d', arrowHeadShapeData);

            headContainer.node().style.webkitTransform = 'translate(' + [headSizePx, headSizePx] + ')';

            var startPoint = path.node().getPointAtLength(0);

            headContainer.node().style.webkitTransform = 'matrix(1, 0, 0, 1, ' + [
                (startPoint.x - size),
                (startPoint.y - size)
            ] + ')';
        },

        trimPointsData = function (pd) {
            for (var i = 0; i < pd.length; i += 1) {
                pd[i].x -= options.headSize;
                pd[i].y -= options.headSize;
            }

            return pd;
        },

        drawPath = function (bezierData) {
            // alt path
            var length,
                pathData = Utils.parseBezier(bezierData),
                startPoint,
                length;

            // set path data
            path = arrowContainer.append('path')
                            .attr('d', pathData)
                            .attr('class', 'arrow-path');

            // get the path length
            length = path.node().getTotalLength();

            /*path.attr('stroke-dasharray', [length, length].toString());
            path.attr('stroke-dashoffset', length);*/
        },

        drawArrow = function () {
            bezierData = Utils.getBezierData(pointsData, curviness);
            drawPath(bezierData);
            drawArrowHead();
            animateArrow();
        },

        deleteArrow = function () {
            if (path) {
                path.remove();
            }

            if (arrowHead) {
                arrowHead.remove();
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
        },

        pointDrag = d3.behavior.drag().on('drag', onDragPoint),

        addArrowButton = $('#draw-arrow'),

        getAnimationDuration = function (pathLength) {
            return options.animationSpeed * pathLength;
        },

        animateArrow = function () {
            timeline.to(
                path,
                speed,
                {
                    'attr': {
                        'stroke-dashoffset': 0
                    },
                    'ease': Linear.easeNone
                },
                'woop'
            );

            pointsData.shift();

            timeline.to(
                headContainer,
                speed,
                {
                    'bezier': {
                        'type': 'thru',
                        'values'    : trimPointsData(pointsData),
                        'autoRotate': true,
                        'curviness' : curviness
                    },
                    'ease': Linear.easeNone
                },
                'woop'
            );
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
