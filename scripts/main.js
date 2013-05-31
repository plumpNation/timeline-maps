var pointsData = [],

    sampleSVG = d3.select('#viz')
        .append('svg')
            .attr('width' , '100%')
            .attr('height', '100%'),

    dotsGroup = sampleSVG.append('g')
            .attr('class', 'dots'),

    curvesGroup = sampleSVG.append('g')
            .attr('class', 'curves'),

    addDot = function (x, y) {
        dotsGroup.append('circle')
            .attr({
                'cx': x,
                'cy': y,
                'r' : 15
            });
    },

    storePoint = function (x, y) {
        addDot(x, y);
        pointsData.push({'x': x, 'y': y});
    },

    getPointsAsString = function () {
        var pointsString = '';

        for(var i = 0; i < pointsData.length; i += 1) {
            pointsString += pointsData[i].x + ',' + pointsData[i].y + ' ';
        }

        return pointsString;
    },

    drawCurve = function () {
        curvesGroup.append('polyline')
            .attr({
                'points': getPointsAsString()
            })
            .style({
                'fill'  : 'none',
                'stroke': 'red',
                'stroke-width': 5
            });

        pointsData = [];
    };

$('svg').on('click', function (e) {
    var x = e.clientX,
        y = e.clientY;

    storePoint(x, y);
});

$('#draw').on('click', function () {
    drawCurve();
});
