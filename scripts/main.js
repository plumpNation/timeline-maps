var timeline,

    $slider = $('#slider'),

    workspace = d3.select('#workspace').append('svg').attr({
        'width' : '100%',
        'height': '100%'
    }),

    i = 0,

    elementCollection = {},

    $arrowControls = $('#add-arrow-info, #draw-arrow'),

    addArrow = function () {
        elementCollection['arrow' + i] = new Arrow(workspace, {
            'onDone': function () {
                $arrowControls.hide();
            },
            'animationSpeed': 2
        }); // needs options

        $arrowControls.show();

        i += 1;
    },

    updateSlider = function (e) {
        $slider.val(timeline.progress() * 100);
    },

    onSliderChange = function (e) {
        var value = $(e.target).val();
        console.log(value);
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

        timeline = new TimelineMax({
            onUpdate : updateSlider,
            delay    : 1
        });

        $('#add-arrow').on('click', addArrow);
    },

    init = function () {
        bindUI();
    };

init();
