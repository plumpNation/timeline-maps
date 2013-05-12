String.prototype.getFileExtension = function () {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(this)[1];
}

String.prototype.hasSvgExtension = function () {
    return this.getFileExtension() === 'svg';
};

Element.prototype.appendSvg = function (url) {
    var adding = $.Deferred();

    if (!url.hasSvgExtension()) {
        url += '.svg';
    }

    $.get(url).then(function (doc) {
        svg = $(doc).find('svg')[0];
        container.appendChild(svg);
        adding.resolve();
    });

    return adding.promise();
};
