// svg.resize.js 0.1.0 - Release for svg.js 1.0.0-rc.9 Copyright (c) 2014 Ulrich-Matthias Schäfer - Licensed under the MIT license

;(function () {

    SVG.extend(SVG.Element, {
        // Resize element with mouse
        resize: function (options) {

            // All the vars we need for our plugin
            var resize, update, done, calc, defaults, snapToGrid
                , element = this;

            // Default values for the options
            defaults = {
                rotPrecision: 2,     // Specifies the speed the rotation is happening when moving the mouse
                snapToGrid: 1        // Snaps to a grid of `snapToGrid` Pixels
            };

            // Merging the defaults and the options-object together
            for (var i in options) {
                if (!defaults.hasOwnProperty(i)) throw('Property ' + i + ' doesn\'t exists');  // We throw an error, if a wrong option was specified
                defaults[i] = options[i];
            }

            // The entry-function for our plugin. Is called whenever resizing starts
            resize = function (event) {

                event = event || window.event;

                // We store our params for the resize on the object
                element.startParams = {
                    x: event.detail.x,      // x-position of the mouse when resizing started
                    y: event.detail.y,      // y-position of the mouse when resizing started
                    box: element.bbox(),    // The bounding-box of the element
                    rbox: element.rbox(),   // The "real"-bounding box (transformations included)
                    rotation: element.transform().rotation  // The current rotation of the element
                };

                // the i-param in the event holds the index of the point which is moved, when using `deepSelect`
                if (event.detail.i !== undefined) {
                    // `deepSelect` is possible with lines, too.
                    // We have to check that and getting the right point here.
                    // So first we build a point-array like the one in polygon and polyline
                    var array = element.type == 'line' ? [
                        [element.attr('x1'), element.attr('y1')],
                        [element.attr('x2'), element.attr('y2')]
                    ] : element.array.value;

                    // Save the index and the point which is moved
                    element.startParams.i = event.detail.i;
                    element.startParams.pointCoords = [array[event.detail.i][0], array[event.detail.i][1]];
                }

                // Lets check which edge of the bounding-box was clicked and resize the element according to this
                switch (event.type) {

                    // Left-Top-Edge
                    case 'lt':
                        // We build a calculating function for every case which gives us the new position of the element
                        calc = function (diffX, diffY) {
                            // The procedure is always the same
                            // First we snap the edge to the given grid (snapping to 1px grid is normal resizing)
                            var snap = snapToGrid(diffX, diffY);

                            // Now we check if the new height and width still valid (> 0)
                            if (element.startParams.box.width - snap[0] > 0 && element.startParams.box.height - snap[1] > 0) {
                                // ...if valid, we resize the element (which can include moving because the coord-system starts at the left-top and this edge is moving sometimes when resized)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y + snap[1]).size(element.startParams.box.width - snap[0], element.startParams.box.height - snap[1]);
                            }
                        };
                        break;

                    // Right-Top
                    case 'rt':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 1 << 1);
                            if (element.startParams.box.width + snap[0] > 0 && element.startParams.box.height - snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + snap[1]).size(element.startParams.box.width + snap[0], element.startParams.box.height - snap[1]);
                        };
                        break;

                    // Right-Bottom
                    case 'rb':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 0);
                            if (element.startParams.box.width + snap[0] > 0 && element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).size(element.startParams.box.width + snap[0], element.startParams.box.height + snap[1]);
                        };
                        break;

                    // Left-Bottom
                    case 'lb':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 1);
                            if (element.startParams.box.width - snap[0] > 0 && element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y).size(element.startParams.box.width - snap[0], element.startParams.box.height + snap[1]);
                        };
                        break;

                    // Top
                    case 't':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 1 << 1);
                            if (element.startParams.box.height - snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + snap[1]).height(element.startParams.box.height - snap[1]);
                        };
                        break;

                    // Right
                    case 'r':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 0);
                            if (element.startParams.box.width + snap[0] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).width(element.startParams.box.width + snap[0]);
                        };
                        break;

                    // Bottom
                    case 'b':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 0);
                            if (element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).height(element.startParams.box.height + snap[1]);
                        };
                        break;

                    // Left
                    case 'l':
                        // s.a.
                        calc = function (diffX, diffY) {
                            var snap = snapToGrid(diffX, diffY, 1);
                            if (element.startParams.box.width - snap[0] > 0)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y).width(element.startParams.box.width - snap[0]);
                        };
                        break;

                    // Rotation
                    case 'rot':
                        // s.a.
                        calc = function (diffX, diffY) {
                            // We have to move the element to the center of the rbox first and change the rotation afterwards
                            // because rotation always works around a rotation-center, which is changed when moving the element.
                            // We also set the new rotation center to the center of the rbox.
                            // The -2 and -1.5 is tuning since the box is jumping for a few px when starting the rotation.
                            element.center(element.startParams.rbox.cx - 2, element.startParams.rbox.cy - 1.5).transform({rotation: element.startParams.rotation + diffX / defaults.rotPrecision, cx: element.startParams.rbox.cx, cy: element.startParams.rbox.cy});
                        };
                        break;

                    // Moving one single Point (needed when an element is deepSelected which means you can move every single point of the object)
                    case 'point':
                        calc = function (diffX, diffY) {

                            // Snapping the point to the grid
                            var snap = snapToGrid(diffX, diffY, element.startParams.pointCoords[0], element.startParams.pointCoords[1]);

                            // We build an object to handle the different properties of a line, if needed
                            var array = element.type == 'line' ? [
                                {
                                    x1: element.startParams.pointCoords[0] + snap[0],
                                    y1: element.startParams.pointCoords[1] + snap[1]
                                },
                                {
                                    x2: element.startParams.pointCoords[0] + snap[0],
                                    y2: element.startParams.pointCoords[1] + snap[1]
                                }
                            ] : element.array.value;    // Otherwise we need the normal point-array


                            if (element.type == 'line') {
                                // Now we can specify the correct property using the array and set them
                                element.attr(array[element.startParams.i]);
                                return;
                            }

                            // Changing the moved point in the array
                            array[element.startParams.i][0] = element.startParams.pointCoords[0] + snap[0];
                            array[element.startParams.i][1] = element.startParams.pointCoords[1] + snap[1];

                            // And plot the new element
                            element.plot(array);
                        };
                }

                // When resizing started, we have to register events for...
                SVG.on(window, 'mousemove', update);    // mousemove to keep track of the changes and...
                SVG.on(window, 'mouseup', done);        // mouseup to know when resizing stops
            };

            // The update-function redraws the element every time the mouse is moving
            update = function (event) {

                event = event || window.event;

                // Calculate the difference between the mouseposition at start and now
                var diffX = event.pageX - element.startParams.x
                    , diffY = event.pageY - element.startParams.y;

                // Calculate the new position and height / width of the element
                calc(diffX, diffY);
            };

            // Is called on mouseup. 
            // Removes the update-function from the mousemove event
            done = function (event) {
                SVG.off(window, 'mousemove', update);
            };


            // The flag is used to determine whether the resizing is used with a left-Point (first bit) and top-point (second bit)
            // In this cases the temp-values are calculated differently
            snapToGrid = function (diffX, diffY, flag, pointCoordsY) {

                var temp;

                // If `pointCoordsY` is given, a single Point has to be snapped (deepSelect). That's why we need a different temp-value
                if (pointCoordsY) {
                    // Note that flag = pointCoordsX in this case
                    temp = [(flag + diffX) % defaults.snapToGrid, (pointCoordsY + diffY) % defaults.snapToGrid];
                } else {
                    // We check if the flag is set and if not we set a default-value (both bits set - which means upper-left-edge)
                    flag = flag == null ? 1 | 1 << 1 : flag;
                    temp = [(element.startParams.box.x + diffX + (flag & 1 ? 0 : element.startParams.box.width)) % defaults.snapToGrid, (element.startParams.box.y + diffY + (flag & (1 << 1) ? 0 : element.startParams.box.height)) % defaults.snapToGrid];
                }

                diffX -= (Math.abs(temp[0]) < defaults.snapToGrid / 2 ? temp[0] : temp[0] - defaults.snapToGrid) + (temp[0] < 0 ? defaults.snapToGrid : 0);
                diffY -= (Math.abs(temp[1]) < defaults.snapToGrid / 2 ? temp[1] : temp[1] - defaults.snapToGrid) + (temp[1] < 0 ? defaults.snapToGrid : 0);
                return [diffX, diffY];

            };

            // We listen to all these events which are specifying different edges
            this.on('lt', resize);  // Left-Top
            this.on('rt', resize);  // Right-Top
            this.on('rb', resize);  // Right-Bottom
            this.on('lb', resize);  // Left-Bottom

            this.on('t', resize);   // Top
            this.on('r', resize);   // Right
            this.on('b', resize);   // Bottom
            this.on('l', resize);   // Left

            this.on('rot', resize); // Rotation

            this.on('point', resize); // Point-Moving

            return this;
        }

    });

}).call(this);