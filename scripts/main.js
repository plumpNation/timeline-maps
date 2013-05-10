var params = {
        'fullscreen': true,
    },

    assets = {
        'location': 'assets/',
        'map': 'europe'
    },

    assetContainer = document.getElementById('assets'),

    container = document.getElementById('app-container'),

    two = new Two().appendTo(container);

$(assetContainer).load(assets.location + assets.map + '.svg');

two.update();
