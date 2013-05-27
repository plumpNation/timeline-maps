var params    = {
        width: '100%',
        height: '100%'
    },

    ns        = 'http://www.w3.org/2000/svg',
    ns2       = 'http://www.w3.org/1999/xlink',

    prefix    = '#two-',

    container = document.getElementById('app-container'),
    two       = new Two(params).appendTo(container),

    points    = [],
    dotsGroup,

    curvesGroupElement,
    curvesGroup,


    clearDots = function () {
        two.remove(dotsGroup);
        dotsGroup = null;
    },

    /**
     * Adds a small polygon and animates it along the path.
     *
     * @param {Two.Polygon} path The path to use as a reference.
     *
     * @see http://jsfiddle.net/FjRZA/
     *
     * Output looks somthing like this hopefully:
     * <path id="cubicCurve" d="..."></path>
     * <circle cx="" cy="" r="5" fill="red">
     *     <animateMotion dur="6s" rotate="auto" fill="freeze">
     *         <mpath xlink:href="#cubicCurve"/>
     *     </animateMotion>
     * </circle>
     */
    addPathAnimation = function (path) {

        var animateMotion = document.createElementNS(ns, 'animateMotion'),
            mpath         = document.createElementNS(ns, 'mpath'),
            circle        = document.createElementNS(ns, 'circle'),
            pathId        = '#two-' + path.id,
            startVertex   = path.vertices[0];

        console.log('Adding path animation');

        curvesGroupElement.appendChild(circle);

        circle.setAttribute('cx'          , startVertex.x);
        circle.setAttribute('cy'          , startVertex.y);
        circle.setAttribute('r'           , '60');
        circle.setAttribute('fill'        , '#336699');
        circle.setAttribute('stroke-width', '5');
        circle.setAttribute('stroke'      , '#FF0000');

        animateMotion.setAttribute('dur'        , '6s');
        animateMotion.setAttribute('rotate'     , 'auto');
        animateMotion.setAttribute('repeatCount', 'indefinite');

        mpath.setAttributeNS(ns2, 'href', pathId);
        animateMotion.appendChild(mpath);

        circle.appendChild(animateMotion);
    },

    takePicture = function (e) {
        // WebActivities
        var pick = new MozActivity({
            name: 'pick',
            data: {
                type: ['image/png', 'image/jpg', 'image/jpeg']
            }
        });

        pick.onsuccess = function () { 
            var piccyUrl = window.URL.createObjectURL(this.result.blob);
            container.style.backgroundImage = piccyUrl;
        };

        pick.onerror = function () { 
            alert("Can't view the image!");
        };
    },

    clearPoints = function () {
        clearDots();
        points = [];
    },

    drawCurveThrough = function (args, pathClosed) {
        var path = two.makeCurve.call(two, args, !pathClosed);

        path.fill      = 'none';
        path.stroke    = 'red';
        path.cap       = 'square';
        path.linewidth = 10;

        return path;

    },

    drawCurve = function (e) {
        var pathClosed  = false,
            args        = _.flatten(points),
            path;

        if (!points.length) {
            return false;
        }

        if (!curvesGroup) {
            curvesGroup = new Two.Group();
            two.add(curvesGroup);
            curvesGroupElement = $(prefix + curvesGroup.id)[0];
        }

        path = drawCurveThrough(args, pathClosed);

        curvesGroup.add(path);
        console.log(curvesGroup.id);

        clearPoints();
        return path;
    },

    storePoint = function (x, y) {
        var point = new Two.Vector(x, y);
        points.push(point);
    },

    addDot = function (x, y) {
        var dot = two.makeCircle(x, y, 3);
        if (!dotsGroup) {
            dotsGroup = new Two.Group();
            two.add(dotsGroup);
        }

        dotsGroup.add(dot);
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
        console.log('Making curve');
        var path = drawCurve();
        if (path) {
            addPathAnimation(path);
        }
    };

$(container).on('click', recordClickLocation);
$('#draw-curve').on('click', submitCurve);

if (typeof MozActivity === 'function') {
    setupForFirefoxOS();
}

two.on('update', function () {
    console.log('updated');
});

// adds the application svg to the page
two.update();
