var params = {
        //'fullscreen': true,
        width: '100%',
        height: '100%'
    },

    points = [],

    container = document.getElementById('app-container'),

    two = new Two(params).appendTo(container),

    clearPaths = function () {
        $('svg path').remove();
    },

    addPathAnimation = function (path) {
        var anim = '<circle cx="" cy="" r="5" fill="red">' +

                '<!-- Define the motion path animation -->' +
                '<animateMotion dur="6s" repeatCount="indefinite">' +
                   '<mpath xlink:href="#two-' + path.id + '"/>' +
                '</animateMotion>' +
            '</circle>';

        $(container).find('svg g').prepend(anim);
    },

    drawCurve = function (e) {
        var pathClosed  = false,
            args        = _.flatten(points),
            path;

        path = two.makeCurve.call(two, args, !pathClosed);

        path.fill = 'none';
        path.stroke = 'red';
        path.linewidth = 10;
    },

    reportLocation = function (x, y) {
        return;
        $('#header2').html(
            'X-Position:' + x + ' Y-Position:' + y);
    },

    storePoint = function (x, y) {
        var point = new Two.Vector(x, y);
        points.push(point);
        reportLocation(x, y);
    },

    addDot = function (x, y) {
        two.makeCircle(x, y, 3);
    },

    recordClickLocation = function (e) {
        var parentOffset = $(this).parent().offset(),
            // offset -> method allows you to retrieve the current position of an
            // element 'relative' to the document.
            x = (e.pageX - parentOffset.left),
            y = (e.pageY - parentOffset.top);

        storePoint(x, y);
        addDot(x, y);
        reportLocation(x, y);
    },

    submitCurve = function () {
        clearPaths();
        drawCurve();
        // addPathAnimation(path);
    };

$(container).on('click', recordClickLocation);
$('#draw-curve').on('click', submitCurve);

// adds the application svg to the page
two.update();
