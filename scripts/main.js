var params = {
        'fullscreen': true,
    },

    points = [],

    container = document.getElementById('app-container'),

    two = new Two().appendTo(container),

    drawCurve = function (e) {
        var pathClosed  = false,
            args        = _.flatten(points),
            path;

        path = two.makeCurve.call(two, args, !pathClosed);

        path.fill = 'none';
        path.stroke = 'red';
        path.linewidth = 10;
        // two.update();
    },

    reportLocation = function (x, y) {
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
    };

$(container).on('click', recordClickLocation);
$('#draw-curve').on('click', drawCurve);

// adds the application svg to the page
two.update();
