svg.resize
==========

An extension of svn.js which allows to resize elements which are selected.
To use this extension you need [svn.select](https://github.com/Fuzzyma/svg.select.js)

# Usage

    var draw = SVG('drawing');
	var rect = draw.rect(100,100);
    rect.select().resize();

Resizing works with all shapes except paths.

# Options

- snapToGrid: Snaps the shape to a virtual grid while resizing (default `1`)
- rotPrecision: Higher Precision increases the mousemovement you need to rotate the same way (default `2`)