svg.resize
==========

An extension of [svg.js](https://github.com/wout/svg.js) which allows to resize elements which are selected.
To use this extension you need [svn.select.js](https://github.com/Fuzzyma/svg.select.js)

# Usage

    var draw = SVG('drawing');
	var rect = draw.rect(100,100);
    rect.select().resize();

# Options

- snapToGrid: Snaps the shape to a virtual grid while resizing (default `1`)
- rotPrecision: Higher Precision increases the mousemovement you need to rotate the same way (default `2`)