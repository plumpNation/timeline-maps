var Utils = (function () {
    var getRotation = function (p1, p2) {
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

        _adaptMatrix = function (matrix) {
            return '-webkit-transform:' + matrix + ';';
        },

        /**
         * A real arse about tit way of creating a transform matrix. We need a matrix because that is
         * what the BezierPlugin (gsap) uses to animate the arrow head. This is not a fast function,
         * so should only be used to place the arrow head initially.
         *
         * @param  {object} translate An object type thing, maybe an SVG point? {x: n, y: n}
         * @param  {number} rotation  Between 0 - 360
         * @return {string}           A css matrix to apply to the arrow head
         */
        createCssTransformMatrix = function (translate, rotation) {
            var translation = [translate.x + 'px', translate.y + 'px'],
                matrix,
                i,

                props = [
                    'MozTransform',
                    'WebkitTransform',
                    'OTransform',
                    'MSTransform',
                    'transform'
                ],

                transformString = 'translate(' + translation + ') rotate(' + rotation + 'deg)',

                dummyDiv = $('<div>').addClass('dummy-div').css({
                    '-webkit-transform': transformString,
                    'visibility'       : 'hidden',
                    'position'         : 'absolute'
                }).appendTo('body'),

                compStyle = window.getComputedStyle(dummyDiv[0], null);

            for (i = 0; i < props.length; i++) {

                matrix = compStyle[props[i]];

                if (matrix != null) {
                    matrix = _adaptMatrix(matrix);
                    // break out of the
                    break;
                }
            }

            dummyDiv.remove();

            return matrix || '';
        },

        /**
         * Creates a d3 tween function for use with arrow head animation.
         *
         * @param  {DOM element} path
         * @return {function}      The tween
         */
        createPathFollowTween = function (pathNode) {
            var pathTotalLength = pathNode.getTotalLength();

            /**
             * The tween function is invoked when the transition starts on each element, being passed
             * the current datum d, the current index i and the current attribute value a, with the this
             * context as the current DOM element. The return value of tween must be an interpolator: a
             * function that maps a parametric value t in the domain [0,1] to a color, number or
             * arbitrary value.
             *
             * @return {function}
             */
            return function tween (d, i, a) {
                var lastPoint;

                // this is the onRenderTick for the path follow animation
                return function (time) {
                    var point       = pathNode.getPointAtLength(time * pathTotalLength),
                        pointString = point.x + ',' + point.y,
                        rotation    = Utils.getRotation(lastPoint || point, point);

                    lastPoint = point;

                    return 'translate(' + pointString + ') rotate(' + rotation + ')';
                };
            };
        },

        showBoundingBox = function (node) {
            var box = node.getBBox();

            return workspace.append('rect')
                .attr({
                    'x': box.x,
                    'y': box.y,
                    'width': box.width,
                    'height': box.height,
                    'class': 'bounding-box'
                });
        },

        /**
         * Create quadratic path based on gsap's bezierThrough data.
         *
         * @return {string} String to use as a path d attribute.
         */
        parseBezier = function (bezierData) {
            var bezierDataLength = bezierData.x.length,
                pathData,
                path,
                i;

            pathData = 'M' + [bezierData.x[0].a, bezierData.y[0].a];

            pathData += 'Q' + [bezierData.x[0].b, bezierData.y[0].b] + ' ' +
                        [bezierData.x[0].c, bezierData.y[0].c];


            for (i = 1; i < bezierDataLength; i += 1) {
                pathData += 'Q' + [bezierData.x[i].b, bezierData.y[i].b] + ' ' +
                        [bezierData.x[i].c, bezierData.y[i].c];
            }

            return pathData;
        },

        getBezierData = function (points, curviness) {
            var bezierData = BezierPlugin.bezierThrough(points, curviness, true);

            return bezierData;
        },

        /**
         * Accepts greensock's bezierData from the BezierPlugin.bezierThrough function.
         * @param  {object} bezierData Greensock's bezier data.
         * @return {object}            [description]
         */
        makeQuadraticBezierData = function (bezierData) {
            var quadraticBezierData = [{
                    x: bezierData.x[0].c,
                    y: bezierData.y[0].c
                }],
                i;

            for (i = 1; i < bezierData.x.length; i += 1) {
                quadraticBezierData.push({x: bezierData.x[i].a, y: bezierData.y[i].a});
                quadraticBezierData.push({x: bezierData.x[i].b, y: bezierData.y[i].b});
            }

            return quadraticBezierData;
        };

    return {
        'getBezierData': getBezierData,
        'parseBezier': parseBezier,
        'getRotation': getRotation,
        'showBoundingBox': showBoundingBox,
        'createPathFollowTween': createPathFollowTween,
        'createCssTransformMatrix': createCssTransformMatrix
    };

}());
