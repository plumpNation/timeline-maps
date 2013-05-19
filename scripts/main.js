var svg,

    params = {
        'fullscreen': true,
    },

    assets = {
        'location': 'assets/',
        'map': 'path_ink'//'star'
    },

    container = document.getElementById('app-container'),

    two = new Two().appendTo(container)

    /**
     * @tutorial http://jonobr1.github.io/two.js/examples/animate-stroke.html
     * Tried to remove as much as possible to break down into simplest form.
     *
     * @param {svg} group
     * @param {number} t
     */
    onSvgLoad = function (svg) {

        var fresh = two.interpret(svg),
            t = 0,
            startOver,

            clearT = function () {
                t = 0;
                setEnding(fresh, 0);

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

                setEnding(fresh, t);

            },

            resizeSvg = function () {
                fresh.translation.set(two.width * 0.5, two.height * 0.5);
            };

        fresh.total = 0;
        fresh.stroke = 'red';
        fresh.linewidth = 40;

        // centering the svg in the page.
        fresh.center().translation.set(two.width / 2, two.height / 2);

        fresh.distances = calculateDistances(fresh);

        _(fresh.distances).each(function (d) {
            fresh.total += d;
        });

        clearT();

        // defer makes the function run at the end of the stack
        _.defer(function () {
            two
                .bind('resize', resizeSvg)
                .bind('update', updateTime)
                .play();
        });
    };



loadSvg(assets.location + assets.map).then(onSvgLoad);

// two.update();
