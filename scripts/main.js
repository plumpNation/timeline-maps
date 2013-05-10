var container = document.getElementById('app-container'),
    two = new Two().appendTo(container)

    circle = two.makeCircle(100, 100, 100);


circle.fill = '#FF0000';
circle.stroke = '#000000';
circle.linewidth = 5;

two.update();
