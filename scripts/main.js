var params = {
        width: '100%',
        height: '100%'
    },

    points = [],

    container = document.getElementById('app-container'),

    two = new Two(params).appendTo(container),

    clearCircles = function () {
        $('.circle').remove();
    },

    addPathAnimation = function (path) {
        var anim = '<circle cx="" cy="" r="45" fill="blue">' +

                '<!-- Define the motion path animation -->' +
                '<animateMotion dur="6s" repeatCount="indefinite">' +
                   '<mpath xlink:href="#two-' + path.id + '"/>' +
                '</animateMotion>' +
            '</circle>';

        $(container).find('svg g').append(anim);
        Two.Utils.setPlaying(true);
    },

    takePicture = function (e) {
        // WebActivities
        var pick = new MozActivity({
            name: "pick",
            data: {
                type: ["image/png", "image/jpg", "image/jpeg"]
            }
        });

        pick.onsuccess = function () { 
            var piccyUrl = window.URL.createObjectURL(this.result.blob);
            $(container).css({
                'background-image': piccyUrl
            });
        };

        pick.onerror = function () { 
            alert("Can't view the image!");
        };
    },

    clearPoints = function () {
        points = [];
    },

    drawCurve = function (e) {
        var pathClosed  = false,
            args        = _.flatten(points),
            path;

        path = two.makeCurve.call(two, args, !pathClosed);

        path.fill = 'none';
        path.stroke = 'red';
        path.cap = 'square';
        path.linewidth = 10;

        clearPoints();
        return path;
    },

    storePoint = function (x, y) {
        var point = new Two.Vector(x, y);
        points.push(point);
    },

    addDot = function (x, y) {
        var circle = two.makeCircle(x, y, 3);
        $(circle).addClass('circle');
    },

    recordClickLocation = function (e) {
        var parentOffset = $('#app-container').offset(),
            // offset -> method allows you to retrieve the current position of an
            // element 'relative' to the document.
            x = (e.pageX - parentOffset.left),
            y = (e.pageY - parentOffset.top);

        storePoint(x, y);
        addDot(x, y);
    },

    addCaptureButton = function () {
        $('<button>')
            .prop('id', 'take-picture')
            .text('Snap!')
            .on('click', takePicture)
            .appendTo('#controls');
    },

    /**
     * Firefox OS specific functions
     * @return {void}
     */
    setupForFirefoxOS = function () {
        addCaptureButton();
    },

    submitCurve = function () {
        var path = drawCurve();
        addPathAnimation(path);
    };

$(container).on('click', recordClickLocation);
$('#draw-curve').on('click', submitCurve);

if (typeof MozActivity === 'function') {
    setupForFirefoxOS();
}

// adds the application svg to the page
two.update();
