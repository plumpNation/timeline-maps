var timeline,

    $slider = $('#slider'),

    application = document.getElementById('application-container'),
    workspace = d3.select('#workspace'),

    i = 0,

    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow'),

    addArrow = function () {
        elementCollection['arrow' + i] = new Arrow(workspace, {
            'onDone': function () {
                $arrowControls.hide();
            },
            'headSize': 15,
            'timelineLabel': 'arrow_' + i,
            'animationSpeed': 2,
        }); // needs options

        $arrowControls.show();

        i += 1;
    },

    updateSlider = function (e) {
        $slider.val(timeline.progress() * 100);
    },

    onSliderChange = function (e) {
        var value = $(e.target).val();
        timeline.pause();
        //adjust the timeline's progress() based on slider value
        timeline.progress(value * 0.01);
    },

    bindUI = function () {
        $slider.on('change', onSliderChange);

        $('#slider, .ui-slider-handle').on('mousedown', function() {
            // 'one' will throw the event once and remove it
            $('html, #slider, .ui-slider-handle').one('mouseup', function (e) {
                timeline.resume();
            });
        });

        $('#add-arrow').on('click', addArrow);
        // $('#add-arrow').on('click', runTest);
    },

    rand = function () {
        return Math.random() * 1000;
    }

    /*runTest = function () {
        var test = $('<div>').appendTo('body').css('background', 'red').width(200).height(200);

        timeline.to(test[0], 1, {
            'bezier': {
                'values': [
                    { x: rand(), y: rand() },
                    { x: rand(), y: rand() },
                    { x: rand(), y: rand() }
                ]
            }
        });
    },*/

    init = function () {
        timeline = new TimelineMax({
            onUpdate : updateSlider
        });

        timeline.pause();

        bindUI();
    };

init();
