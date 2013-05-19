(function () {
    'use strict';

    var svg,

        params = {
            'fullscreen': true,
        },

        assets = {
            'location': 'assets/',
            'file'    : 'path_ink'//'star'
        },

        container = document.getElementById('app-container'),

        two = new Two(params).appendTo(container),

        /**
         * @tutorial http://jonobr1.github.io/two.js/examples/animate-stroke.html
         * Tried to remove as much as possible to break down into simplest form.
         *
         * @see funcs.js All functions where possible are moved out of this view file into funcs.js.
         * @param {svg} group
         * @param {number} t
         */
        onSvgLoad = function (svg) {

            var startOver,

                interprettedSVG = two.interpret(svg),

                t = 0,

                settings = {
                    'stroke'    : 'red',
                    'linewidth' : 10
                },

                clearT = function () {
                    t = 0;
                    setEnding(interprettedSVG, 0);

                    // After calling startOver 60 times, run clearT
                    // since this is called after the animation is finished,
                    // the end result is the pause between the end of the animation
                    // and the beginning of the new one.
                    startOver = _.after(60, clearT);
                },

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
                        i += 1;
                    });
                },

                updateTime = function () {

                    if (t < 0.9999) {
                        t += 0.00625;

                    } else {
                        startOver();
                    }

                    setEnding(interprettedSVG, t);

                },

                resizeSvg = function () {
                    interprettedSVG.translation.set(two.width * 0.5, two.height * 0.5);
                };

            _(interprettedSVG).extend(settings);

            // centering the svg in the page.
            interprettedSVG.center().translation.set(two.width * 0.5, two.height * 0.5);

            _(interprettedSVG).extend({
                distances: calculateDistances(interprettedSVG),
                total    : 0
            });

            _(interprettedSVG.distances).each(function (distance) {
                interprettedSVG.total += distance;
            });

            clearT();

            // defer makes the callback run at the end of the stack
            _.defer(function () {
                two
                    .bind('resize', resizeSvg)
                    .bind('update', updateTime)
                    .play();
            });
        };



    loadSvg(assets.location + assets.file).then(onSvgLoad);

    // two.update();

}());
