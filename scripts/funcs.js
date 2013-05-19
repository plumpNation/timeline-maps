/* PROTOTYPE UTILS */
String.prototype.getFileExtension = function () {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(this)[1];
}

String.prototype.hasSvgExtension = function () {
    return this.getFileExtension() === 'svg';
};

/* UTILS */

/**
 * Calculates the distance between all the vertices in all the groups
 * @param  {object} group The group containing children to parse
 * @return {array}        An array of distances
 */
var calculateDistances = function (group) {
    var distances = _(group.children).map(function (child) {
            var distance = 0,
                lastVertex;

            _(child.vertices).each(function (vertex, key) {
                var betweenVertices;

                if (key > 0) {
                    betweenVertices = lastVertex.distanceTo(vertex);
                    distance += betweenVertices;
                }

                lastVertex = vertex;
            });

            // I'm not sure if rounding is the best idea, however...
            return Math.round(distance);
        });

        return distances;
    },

    /**
     * Restricts a number within two values.
     *
     * This one liner is good to know:
     * Math.max(minValue, Math.min(maxValue, valueToClamp));
     * taken from http://actionsnippet.com/?p=475
     *
     * @param  {number} valueToClamp    The number to clamp
     * @param  {number} clampMin        Minimum number
     * @param  {number} clampMax        Maximum number
     * @return {number}
     */
    clamp = function (valueToClamp, clampMin, clampMax) {
        // If the value to clamp is larger than the max, we must choose the max,
        // so we choose the smallest out of the two numbers.
        var maxValue = Math.min(valueToClamp, clampMax);

        // Now return the largest of the two numbers.
        return Math.max(maxValue, clampMin);
    },

    map = function (v, i1, i2, o1, o2) {
        return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
    },

    cmap = function (v, i1, i2, o1, o2) {
        var mapped = map(v, i1, i2, o1, o2);
        return clamp(mapped, o1, o2);
    },

    loadSvg = function (url) {
        var loading = $.Deferred();

        if (!url.hasSvgExtension()) {
            url += '.svg';
        }

        $.get(url).then(function (doc) {
            svg = $(doc).find('svg')[0];
            loading.resolve(svg);
        });

        return loading.promise();
    };
