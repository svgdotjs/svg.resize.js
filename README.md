svg.resize.js
=============

An extension of [svg.js](https://github.com/wout/svg.js) which allows to resize elements which are selected with [svn.select.js](https://github.com/Fuzzyma/svg.select.js)

# Demo

For a demo see http://fuzzyma.github.io/svg.resize.js/

# Get Started

- Install `svg.resize.js` using bower:

		bower install svg.resize.js

- Include the script after svg.js and svg.select.js into your page

		<script src="svg.js"></script>
		<script src="svg.select.js"></script>
		<script src="svg.resize.js"></script>

- Select a rectangle and make it resizeable:

		<div id="myDrawing"></div>

		var drawing = new SVG('myDrawing').size(500, 500);
		drawing.rect(50,50).select().resize()

# Usage

Activate resizing

    var draw = SVG('drawing');
	var rect = draw.rect(100,100);
    rect.select().resize();

Deactivate resizing

	rect.resize('stop');

# Options

- `snapToGrid`: Snaps the shape to a virtual grid while resizing (default `1`)
- `snapToAngle`: Snaps to an angle when rotating (default `0.1`)

# Events

- `resizedone`: Fired when resizing is done