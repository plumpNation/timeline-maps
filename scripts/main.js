var params = {
        'fullscreen': true,
    },

    assets = {
        'location': 'assets/',
        'map': 'triangleInk'
    },

    container = document.getElementById('app-container'),

    two = new Two().appendTo(container),

    map;

$.get(assets.location + assets.map + '.svg').then(function (doc) {
    // an svg is in fact a document so we need to extract the actual svg tag from it.
    var data = $(doc).find('svg')[0];
    map = two.interpret(data);
    /*$(container).append(map);*/
});

two.update();
