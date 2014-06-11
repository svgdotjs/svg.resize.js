// svg.resize.js 0.1.0 - Copyright (c) 2014 Urich-Matthias Schäfer - Licensed under the MIT license

// TODO: Maybe use nested SVG instead of group to avoid translation when moving

;(function() {

    SVG.extend(SVG.Element, {
        // Resize element with mouse
        resize: function(options) {

            var resize, update, done, calc, defaults, movePoint, snapToGrid
                , element = this;

            defaults = {
                rotPrecision:2,
                snapToGrid:1
                //FIXME: snapToGrid
            };

            for(var i in options){
                if(defaults[i] === undefined)throw('Property '+i+' doesn\'t exists');
                defaults[i] = options[i];
            }

            var firstBox = element.bbox();

            resize = function(event){

                element.startParams = {x:event.detail.x, y:event.detail.y, box:element.bbox(), rbox:element.rbox(), rotation:element.transform().rotation};

                if(event.detail.i !== undefined){
                    var array = element.type == 'line' ? [[element.attr('x1'), element.attr('y1')],[element.attr('x2'),element.attr('y2')]] : element.array.value;
                    element.startParams.i = event.detail.i;
                    element.startParams.pointCoords = [array[event.detail.i][0], array[event.detail.i][1]];
                }

                switch(event.type){
                    case 'lt':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY);
                            if(element.startParams.box.width - snap[0] > 0 && element.startParams.box.height - snap[1] > 0)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y + snap[1]).size(element.startParams.box.width - snap[0], element.startParams.box.height - snap[1]);
                        };
                        break;
                    case 'rt':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 1<<1);
                            if(element.startParams.box.width + snap[0] > 0 && element.startParams.box.height - snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + snap[1]).size(element.startParams.box.width + snap[0], element.startParams.box.height - snap[1]);
                        };
                        break;
                    case 'rb':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 0);
                            if(element.startParams.box.width + snap[0] > 0 && element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).size(element.startParams.box.width + snap[0], element.startParams.box.height + snap[1]);
                        };
                        break;
                    case 'lb':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 1);
                            if(element.startParams.box.width - snap[0] > 0 && element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y).size(element.startParams.box.width - snap[0], element.startParams.box.height + snap[1]);
                        };
                        break;
                    case 't':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 1<<1);
                            if(element.startParams.box.height - snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + snap[1]).height(element.startParams.box.height - snap[1]);
                        };
                        break;
                    case 'r':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 0);
                            if(element.startParams.box.width + snap[0] > 0)
                            element.move(element.startParams.box.x, element.startParams.box.y).width(element.startParams.box.width + snap[0]);
                        };
                        break;
                    case 'b':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 0);
                            if(element.startParams.box.height + snap[1] > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).height(element.startParams.box.height + snap[1]);
                        };
                        break;
                    case 'l':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY, 1);
                            if(element.startParams.box.width - snap[0] > 0)
                                element.move(element.startParams.box.x + snap[0], element.startParams.box.y).width(element.startParams.box.width - snap[0]);
                        };
                        break;
                    case 'rot':
                        calc = function(diffX, diffY){ // this -2 and -1.5 is tuning since rbox has 1px to much at top and left
                            element.center(element.startParams.rbox.cx-2, element.startParams.rbox.cy-1.5).transform({rotation:element.startParams.rotation + diffX/defaults.rotPrecision, cx:element.startParams.rbox.cx, cy:element.startParams.rbox.cy});
                        };
                        break;
                    case 'point':
                        calc = function(diffX, diffY){
                            var snap = snapToGrid(diffX, diffY,element.startParams.pointCoords[0], element.startParams.pointCoords[1]);

                            var array = element.type == 'line' ? [
                                {
                                    x1:element.startParams.pointCoords[0]+snap[0],
                                    y1:element.startParams.pointCoords[1]+snap[1]
                                },
                                {
                                    x2:element.startParams.pointCoords[0]+snap[0],
                                    y2:element.startParams.pointCoords[1]+snap[1]
                                }
                            ] : element.array.value;
                            if(element.type == 'line'){
                                element.attr(array[element.startParams.i]);
                                return;
                            }

                            array[element.startParams.i][0] = element.startParams.pointCoords[0] + snap[0];
                            array[element.startParams.i][1] = element.startParams.pointCoords[1] + snap[1];

                            element.plot(array);
                        };
                }

                SVG.on(window, 'mousemove', update);
                SVG.on(window, 'mouseup', done);
            };

            update = function(event){
                var diffX = event.pageX - element.startParams.x
                  , diffY = event.pageY - element.startParams.y;

                calc(diffX, diffY);
            };

            done = function(event){
                SVG.off(window, 'mousemove', update);
            };


            // The flag is used to determine whether the resizing is used with a left-Point (first bit) and top-point (second bit)
            // In this cases the temp-values are calculated differently
            snapToGrid = function(diffX, diffY, flag, pointCoordsY){

                var temp;

                // If pointCoordsY is given, a single Point has to be snapped (deepselect). Thats why we need a different temp-value
                if(pointCoordsY){
                    temp = [(flag+diffX) % defaults.snapToGrid, (pointCoordsY+diffY) % defaults.snapToGrid];
                }else{
                    flag = flag == null ? 1 | 1<<1 : flag;
                    temp = [(element.startParams.box.x+diffX + (flag & 1 ? 0 : element.startParams.box.width)) % defaults.snapToGrid, (element.startParams.box.y+diffY + (flag & (1<<1) ? 0 : element.startParams.box.height)) % defaults.snapToGrid];
                }
                //var temp = [(element.startParams.box.x+diffX + (flag & 1 ? 0 : element.startParams.box.width)) % defaults.snapToGrid, (element.startParams.box.y+diffY + (flag & (1<<1) ? 0 : element.startParams.box.height)) % defaults.snapToGrid];
                diffX -= (Math.abs(temp[0]) < defaults.snapToGrid/2 ? temp[0] : temp[0]-defaults.snapToGrid) + (temp[0] < 0 ? defaults.snapToGrid : 0);
                diffY -= (Math.abs(temp[1]) < defaults.snapToGrid/2 ? temp[1] : temp[1]-defaults.snapToGrid) + (temp[1] < 0 ? defaults.snapToGrid : 0);
                return [diffX, diffY];

            };

            this.on('lt', resize);
            this.on('rt', resize);
            this.on('rb', resize);
            this.on('lb', resize);

            this.on('t', resize);
            this.on('r', resize);
            this.on('b', resize);
            this.on('l', resize);

            this.on('rot', resize);

            this.on('point', resize);

        }

    });

}).call(this);