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

        /**
         * Creates a d3 tween function for use with
         * @param  {object} path d3 selected path to follow.
         * @return {function}      The tween
         */
        createPathFollowTween = function (path) {
            var pathNode = path.node(),
                pathTotalLength = pathNode.getTotalLength();

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
        };

    return {
        'getRotation': getRotation,
        'showBoundingBox': showBoundingBox,
        'createPathFollowTween': createPathFollowTween
    };

}());
