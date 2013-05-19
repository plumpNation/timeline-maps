'use strict';

var svg,
    interprettedSVG,

    two,
    container,

    time = 0,

    animationIncrement = 0.00625,

    params = {
        'fullscreen': true,
    },

    assets = {
        'location': 'assets/',
        'file'    : 'path_ink'//'star'
    },


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

            settings = {
                'stroke'    : 'red',
                'linewidth' : 10
            },

            resetTime = function () {
                time = 0;
                setEnding(interprettedSVG, 0);

                // After calling startOver 60 times, run resetTime.
                // Since this is called after the animation is finished,
                // the end result is the pause between the end of the animation
                // and the beginning of the new one.
                startOver = _.after(60, resetTime);
            },

            updateTime = function () {
                if (time < 0.9999) {
                    time += animationIncrement;

                } else {
                    startOver();
                }

                setEnding(interprettedSVG, time);
            },

            /**
             * Center and size the svg in the page.
             *
             * @return {void}
             */
            resizeSvg = function () {
                var halfWidth = two.width * 0.5,
                    halfHeight = two.height * 0.5;

                interprettedSVG.center().translation.set(halfWidth, halfHeight);
            };

        interprettedSVG = two.interpret(svg);

        _(interprettedSVG).extend(settings)

        interprettedSVG.distances   = calculateDistances(interprettedSVG);
        interprettedSVG.total       = 0;

        _(interprettedSVG.distances).each(function (distance) {
            interprettedSVG.total += distance;
        });

        resetTime();
        resizeSvg();

        two
            .bind('resize', resizeSvg)
            .bind('update', updateTime)
            .play();

        // Can be used simply like this
        // setEnding(svg, time);
        // two.update();
    };

container = document.getElementById('app-container');
two       = new Two(params).appendTo(container);

loadSvg(assets.location + assets.file).then(onSvgLoad);

