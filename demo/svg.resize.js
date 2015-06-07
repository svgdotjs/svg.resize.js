/*! svg.resize.js - v1.0.0 - 2015-06-08
* https://github.com/Fuzzyma/svg.resize.js
* Copyright (c) 2015 Ulrich-Matthias Schäfer; Licensed MIT */
;(function () {

    // Calculates the offset of an element
    function offset(el) {
        var x = 0, y = 0;

        if ('doc' in el) {
            var box = el.bbox();
            x = box.x;
            y = box.y;
            el = el.doc().parent;
        }

        while (el.nodeName.toUpperCase() !== 'BODY') {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }

        return {x: x, y: y};
    }

    function ResizeHandler(el) {

        el.remember('_resizeHandler', this);

        this.el = el;
        this.parameters = {};
        this.lastUpdateCall = null;

    }

    ResizeHandler.prototype.init = function (options) {

        var _this = this;

        this.stop();

        if (options === 'stop') {
            return;
        }

        this.options = {};

        // Merge options and defaults
        for (var i in this.el.resize.defaults) {
            this.options[i] = this.el.resize.defaults[i];
            if (typeof options[i] !== 'undefined') {
                this.options[i] = options[i];
            }
        }
        
        // We listen to all these events which are specifying different edges
        this.el.on('lt.resize', function(e){ _this.resize(e || window.event); });  // Left-Top
        this.el.on('rt.resize', function(e){ _this.resize(e || window.event); });  // Right-Top
        this.el.on('rb.resize', function(e){ _this.resize(e || window.event); });  // Right-Bottom
        this.el.on('lb.resize', function(e){ _this.resize(e || window.event); });  // Left-Bottom

        this.el.on('t.resize', function(e){ _this.resize(e || window.event); });   // Top
        this.el.on('r.resize', function(e){ _this.resize(e || window.event); });   // Right
        this.el.on('b.resize', function(e){ _this.resize(e || window.event); });   // Bottom
        this.el.on('l.resize', function(e){ _this.resize(e || window.event); });   // Left

        this.el.on('rot.resize', function(e){ _this.resize(e || window.event); }); // Rotation

        this.el.on('point.resize', function(e){ _this.resize(e || window.event); }); // Point-Moving
        
        // This call ensures, that the plugin reacts to a change of snapToGrid immediately
        this.update();
    
    };
    
    ResizeHandler.prototype.stop = function(){
        this.el.off('lt.resize');
        this.el.off('rt.resize');
        this.el.off('rb.resize');
        this.el.off('lb.resize');

        this.el.off('t.resize');
        this.el.off('r.resize');
        this.el.off('b.resize');
        this.el.off('l.resize');

        this.el.off('rot.resize');

        this.el.off('point.resize');

        return this;
    };

    ResizeHandler.prototype.resize = function (event) {

        var _this = this;

        this.parameters = {
            x: event.detail.x,      // x-position of the mouse when resizing started
            y: event.detail.y,      // y-position of the mouse when resizing started
            box: this.el.bbox(),    // The bounding-box of the element
            rbox: this.el.rbox(),   // The "real"-bounding box (transformations included)
            rotation: this.el.transform().rotation  // The current rotation of the element
        };

        // the i-param in the event holds the index of the point which is moved, when using `deepSelect`
        if (event.detail.i !== undefined) {
            // `deepSelect` is possible with lines, too.
            // We have to check that and getting the right point here.
            // So first we build a point-array like the one in polygon and polyline
            var array = this.el.type === 'line' ? [
                [this.el.attr('x1'), this.el.attr('y1')],
                [this.el.attr('x2'), this.el.attr('y2')]
            ] : this.el.array.value;

            // Save the index and the point which is moved
            this.parameters.i = event.detail.i;
            this.parameters.pointCoords = [array[event.detail.i][0], array[event.detail.i][1]];
        }

        // Lets check which edge of the bounding-box was clicked and resize the this.el according to this
        switch (event.type) {

            // Left-Top-Edge
            case 'lt':
                // We build a calculating function for every case which gives us the new position of the this.el
                this.calc = function (diffX, diffY) {
                    // The procedure is always the same
                    // First we snap the edge to the given grid (snapping to 1px grid is normal resizing)
                    var snap = this.snapToGrid(diffX, diffY);

                    // Now we check if the new height and width still valid (> 0)
                    if (this.parameters.box.width - snap[0] > 0 && this.parameters.box.height - snap[1] > 0) {
                        // ...if valid, we resize the this.el (which can include moving because the coord-system starts at the left-top and this edge is moving sometimes when resized)
                        this.el.move(this.parameters.box.x + snap[0], this.parameters.box.y + snap[1]).size(this.parameters.box.width - snap[0], this.parameters.box.height - snap[1]);
                    }
                };
                break;

            // Right-Top
            case 'rt':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 1 << 1);
                    if (this.parameters.box.width + snap[0] > 0 && this.parameters.box.height - snap[1] > 0) {
                        this.el.move(this.parameters.box.x, this.parameters.box.y + snap[1]).size(this.parameters.box.width + snap[0], this.parameters.box.height - snap[1]);
                    }
                };
                break;

            // Right-Bottom
            case 'rb':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 0);
                    if (this.parameters.box.width + snap[0] > 0 && this.parameters.box.height + snap[1] > 0) {
                        this.el.move(this.parameters.box.x, this.parameters.box.y).size(this.parameters.box.width + snap[0], this.parameters.box.height + snap[1]);
                    }
                };
                break;

            // Left-Bottom
            case 'lb':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 1);
                    if (this.parameters.box.width - snap[0] > 0 && this.parameters.box.height + snap[1] > 0) {
                        this.el.move(this.parameters.box.x + snap[0], this.parameters.box.y).size(this.parameters.box.width - snap[0], this.parameters.box.height + snap[1]);
                    }
                };
                break;

            // Top
            case 't':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 1 << 1);
                    if (this.parameters.box.height - snap[1] > 0) {
                        this.el.move(this.parameters.box.x, this.parameters.box.y + snap[1]).height(this.parameters.box.height - snap[1]);
                    }
                };
                break;

            // Right
            case 'r':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 0);
                    if (this.parameters.box.width + snap[0] > 0) {
                        this.el.move(this.parameters.box.x, this.parameters.box.y).width(this.parameters.box.width + snap[0]);
                    }
                };
                break;

            // Bottom
            case 'b':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 0);
                    if (this.parameters.box.height + snap[1] > 0) {
                        this.el.move(this.parameters.box.x, this.parameters.box.y).height(this.parameters.box.height + snap[1]);
                    }
                };
                break;

            // Left
            case 'l':
                // s.a.
                this.calc = function (diffX, diffY) {
                    var snap = this.snapToGrid(diffX, diffY, 1);
                    if (this.parameters.box.width - snap[0] > 0) {
                        this.el.move(this.parameters.box.x + snap[0], this.parameters.box.y).width(this.parameters.box.width - snap[0]);
                    }
                };
                break;

            // Rotation
            case 'rot':
                // s.a.
                this.calc = function (diffX, diffY) {

                    // yes this is kinda stupid but we need the mouse coords back...
                    var current = {x: diffX + this.parameters.x, y: diffY + this.parameters.y};
                    
                    // we need the offset of the element to calculate our angle
                    var off = offset(this.el);

                    // start minus middle
                    var sAngle = Math.atan2((this.parameters.y - off.y - this.parameters.rbox.height / 2), (this.parameters.x - off.x - this.parameters.rbox.width / 2));

                    // end minus middle
                    var pAngle = Math.atan2((current.y - off.y - this.parameters.rbox.height / 2), (current.x - off.x - this.parameters.rbox.width / 2));

                    var angle = (pAngle - sAngle) * 180 / Math.PI;

                    // We have to move the element to the center of the rbox first and change the rotation afterwards
                    // because rotation always works around a rotation-center, which is changed when moving the this.el.
                    // We also set the new rotation center to the center of the rbox.
                    // The -0.5 and -1 is tuning since the box is jumping for a few px when starting the rotation.
                    this.el.center(this.parameters.rbox.cx - 0.5, this.parameters.rbox.cy - 1).transform({rotation: this.parameters.rotation + angle - angle % this.options.snapToAngle, cx: this.parameters.rbox.cx, cy: this.parameters.rbox.cy});
                };
                break;

            // Moving one single Point (needed when an this.el is deepSelected which means you can move every single point of the object)
            case 'point':
                this.calc = function (diffX, diffY) {

                    // Snapping the point to the grid
                    var snap = this.snapToGrid(diffX, diffY, this.parameters.pointCoords[0], this.parameters.pointCoords[1]);

                    // We build an object to handle the different properties of a line, if needed
                    var array = this.el.type === 'line' ? [
                        {
                            x1: this.parameters.pointCoords[0] + snap[0],
                            y1: this.parameters.pointCoords[1] + snap[1]
                        },
                        {
                            x2: this.parameters.pointCoords[0] + snap[0],
                            y2: this.parameters.pointCoords[1] + snap[1]
                        }
                    ] : this.el.array.value;    // Otherwise we need the normal point-array


                    if (this.el.type === 'line') {
                        // Now we can specify the correct property using the array and set them
                        this.el.attr(array[this.parameters.i]);
                        return;
                    }

                    // Changing the moved point in the array
                    array[this.parameters.i][0] = this.parameters.pointCoords[0] + snap[0];
                    array[this.parameters.i][1] = this.parameters.pointCoords[1] + snap[1];

                    // And plot the new this.el
                    this.el.plot(array);
                };
        }

        // When resizing started, we have to register events for...
        SVG.on(window, 'mousemove.resize', function (e) {
            _this.update(e || window.event);
        });    // mousemove to keep track of the changes and...
        SVG.on(window, 'mouseup.resize', function () {
            _this.done();
        });        // mouseup to know when resizing stops

    };

    // The update-function redraws the element every time the mouse is moving
    ResizeHandler.prototype.update = function (event) {

        if (!event) {
            if (this.lastUpdateCall) {
                this.calc(this.lastUpdateCall[0], this.lastUpdateCall[1]);
            }
            return;
        }

        // Calculate the difference between the mouseposition at start and now
        var diffX = event.pageX - this.parameters.x
            , diffY = event.pageY - this.parameters.y;

        this.lastUpdateCall = [diffX, diffY];

        // Calculate the new position and height / width of the element
        this.calc(diffX, diffY);
    };

    // Is called on mouseup. 
    // Removes the update-function from the mousemove event
    ResizeHandler.prototype.done = function () {
        this.lastUpdateCall = null;
        SVG.off(window, 'mousemove.resize');
        SVG.off(window, 'mouseup.resize');
        this.el.fire('resizedone');
    };

    // The flag is used to determine whether the resizing is used with a left-Point (first bit) and top-point (second bit)
    // In this cases the temp-values are calculated differently
    ResizeHandler.prototype.snapToGrid = function (diffX, diffY, flag, pointCoordsY) {

        var temp;

        // If `pointCoordsY` is given, a single Point has to be snapped (deepSelect). That's why we need a different temp-value
        if (pointCoordsY) {
            // Note that flag = pointCoordsX in this case
            temp = [(flag + diffX) % this.options.snapToGrid, (pointCoordsY + diffY) % this.options.snapToGrid];
        } else {
            // We check if the flag is set and if not we set a default-value (both bits set - which means upper-left-edge)
            flag = flag == null ? 1 | 1 << 1 : flag;
            temp = [(this.parameters.box.x + diffX + (flag & 1 ? 0 : this.parameters.box.width)) % this.options.snapToGrid, (this.parameters.box.y + diffY + (flag & (1 << 1) ? 0 : this.parameters.box.height)) % this.options.snapToGrid];
        }

        diffX -= (Math.abs(temp[0]) < this.options.snapToGrid / 2 ? temp[0] : temp[0] - this.options.snapToGrid) + (temp[0] < 0 ? this.options.snapToGrid : 0);
        diffY -= (Math.abs(temp[1]) < this.options.snapToGrid / 2 ? temp[1] : temp[1] - this.options.snapToGrid) + (temp[1] < 0 ? this.options.snapToGrid : 0);
        return [diffX, diffY];

    };

    SVG.extend(SVG.Element, {
        // Resize element with mouse
        resize: function (options) {

            (this.remember('_resizeHandler') || new ResizeHandler(this)).init(options || {});

            return this;

        }

    });

    SVG.Element.prototype.resize.defaults = {
        snapToAngle: 0.1,    // Specifies the speed the rotation is happening when moving the mouse
        snapToGrid: 1        // Snaps to a grid of `snapToGrid` Pixels
    };

}).call(this);