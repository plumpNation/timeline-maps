$(function () {

    var two = new Two({
        fullscreen: true
    }).appendTo(document.body);

    $.get('../images/fresh.svg', function (doc) {

        var fresh = two.interpret($(doc).find('svg')[0]);
        var t = 0;
        var startOver, movingmouse = false;
        var clearT = function () {
            t = 0;
            setEnding(fresh, 0);
            startOver = _.after(60, clearT);
        };
        var stopMouse = _.debounce(function () {
            movingmouse = false;
        }, 1000);

        fresh.center().translation.set(two.width / 2, two.height / 2);
        fresh.distances = calculateDistances(fresh);
        fresh.total = 0;
        fresh.stroke = 'white';
        fresh.linewidth = 40;
        _.each(fresh.distances, function (d) {
            fresh.total += d;
        });

        clearT();

        $(window)
            .bind('mousemove', mousemove)
            .bind('touchmove', function (e) {
            var touch = e.originalEvent.changedTouches[0];
            mousemove({
                clientX: touch.pageX,
                clientY: touch.pageY
            });
            return false;
        });

        _.defer(function () {

            two
                .bind('resize', function () {

                fresh.translation.set(two.width / 2, two.height / 2);

            })
                .bind('update', function () {

                if (movingmouse) {
                    return;
                }

                if (t < 0.9999) {
                    t += 0.00625;
                } else {
                    startOver();
                }

                setEnding(fresh, t);

            }).play();

        });

        function mousemove(e) {
            var rect = fresh.getBoundingClientRect();
            movingmouse = true;
            t = cmap(e.clientX, rect.left, rect.right, 0, 1);
            setEnding(fresh, t);
            stopMouse();
        }

        function setEnding(group, t) {

            var i = 0;
            var traversed = t * group.total;
            var current = 0;

            _.each(group.children, function (child) {
                var distance = group.distances[i];
                var min = current;
                var max = current + distance;
                var pct = cmap(traversed, min, max, 0, 1);
                child.ending = pct;
                current = max;
                i++;
            });

        }

    });

});

function calculateDistances(group) {
    return _.map(group.children, function (child) {
        var d = 0,
            a;
        _.each(child.vertices, function (b, i) {
            if (i > 0) {
                d += a.distanceTo(b);
            }
            a = b;
        });
        return d;
    });
}

function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}

function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
}

function cmap(v, i1, i2, o1, o2) {
    return clamp(map(v, i1, i2, o1, o2), o1, o2);
}
