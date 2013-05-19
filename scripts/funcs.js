/* PROTOTYPE UTILS */
String.prototype.getFileExtension = function () {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(this)[1];
}

String.prototype.hasSvgExtension = function () {
    return this.getFileExtension() === 'svg';
};

/* UTILS */
var calculateDistances = function (group) {
        return _.map(group.children, function (child) {
            var d = 0,
                a;

            _.each(child.vertices, function (b, i) {
                if (i > 0) {
                    d += a.distanceTo(b);
                }
                a = b;
            });

            return d;
        });
    },

    clamp = function (v, min, max) {
        return Math.max(Math.min(v, max), min);
    },

    map = function (v, i1, i2, o1, o2) {
        return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
    },

    cmap = function (v, i1, i2, o1, o2) {
        return clamp(map(v, i1, i2, o1, o2), o1, o2);
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
