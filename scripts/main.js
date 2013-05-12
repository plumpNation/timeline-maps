var svg,

    params = {
        'fullscreen': true,
    },

    assets = {
        'location': 'assets/',
        'map': 'star'
    },

    container = document.getElementById('app-container'),

    two = new Two().appendTo(container)

    /**
     * @tutorial http://jonobr1.github.io/two.js/examples/animate-stroke.html
     * @param {svg} group
     * @param {number} t
     */
    setEnding = function (group, t) {

        var i = 0,
            traversed = t * group.total,
            current = 0;

            _(group.children).each(function (child) {
                var distance = group.distances[i],
                    min = current,
                    max = current + distance,
                    pct = cmap(traversed, min, max, 0, 1);

                child.ending = pct;
                current = max;
                i++;
            }
        );
    };

container.appendSvg(assets.location + assets.map).then(function () {
    //
});

// two.update();
