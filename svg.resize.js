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
                            //if(snapToGrid(element.startParams.box.width - diffX) > 0 && snapToGrid(element.startParams.box.height - diffY) > 0){
                                //var snapped = snapToGrid(element.startParams.box.x + diffX, element.startParams.box.y + diffY, diffX, diffY);
                                //element.move(snapped[0], snapped[1]).size(element.startParams.box.width - snapped[2], element.startParams.box.height - snapped[3]);
                            if(element.startParams.box.width - diffX > 0 && element.startParams.box.height - diffY > 0)
                                element.move(element.startParams.box.x + diffX, element.startParams.box.y + diffY).size(element.startParams.box.width - diffX, element.startParams.box.height - diffY);
                        };
                        break;
                    case 'rt':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.width + diffX > 0 && element.startParams.box.height - diffY > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + diffY).size(element.startParams.box.width + diffX, element.startParams.box.height - diffY);
                        };
                        break;
                    case 'rb':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.width + diffX > 0 && element.startParams.box.height + diffY > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).size(element.startParams.box.width + diffX, element.startParams.box.height + diffY);
                        };
                        break;
                    case 'lb':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.width - diffX > 0 && element.startParams.box.height + diffY > 0)
                                element.move(element.startParams.box.x + diffX, element.startParams.box.y).size(element.startParams.box.width - diffX, element.startParams.box.height + diffY);
                        };
                        break;
                    case 't':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.height - diffY > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y + diffY).height(element.startParams.box.height - diffY);
                        };
                        break;
                    case 'r':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.width + diffX > 0)
                            element.move(element.startParams.box.x, element.startParams.box.y).width(element.startParams.box.width + diffX);
                        };
                        break;
                    case 'b':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.height + diffY > 0)
                                element.move(element.startParams.box.x, element.startParams.box.y).height(element.startParams.box.height + diffY);
                        };
                        break;
                    case 'l':
                        calc = function(diffX, diffY){
                            if(element.startParams.box.width - diffX > 0)
                                element.move(element.startParams.box.x + diffX, element.startParams.box.y).width(element.startParams.box.width - diffX);
                        };
                        break;
                    case 'rot':
                        calc = function(diffX, diffY){ // this -2 and -1.5 is tuning since rbox has 1px to much at top and left
                            element.center(element.startParams.rbox.cx-2, element.startParams.rbox.cy-1.5).transform({rotation:element.startParams.rotation + diffX/defaults.rotPrecision, cx:element.startParams.rbox.cx, cy:element.startParams.rbox.cy});
                        };
                        break;
                    case 'point':
                        calc = function(diffX, diffY){
                            var array = element.type == 'line' ? [
                                {
                                    x1:element.startParams.pointCoords[0]+diffX,
                                    y1:element.startParams.pointCoords[1]+diffY
                                },
                                {
                                    x2:element.startParams.pointCoords[0]+diffX,
                                    y2:element.startParams.pointCoords[1]+diffY
                                }
                            ] : element.array.value;
                            if(element.type == 'line'){
                                element.attr(array[element.startParams.i]);
                                return;
                            }

                            array[element.startParams.i][0] = element.startParams.pointCoords[0] + diffX;
                            array[element.startParams.i][1] = element.startParams.pointCoords[1] + diffY;

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
            /*
            snapToGrid = function(draw, draw2, diffX, diffY){
                if(draw2){
                    var temp = [draw % defaults.snapToGrid, draw2 % defaults.snapToGrid, diffX % defaults.snapToGrid, diffY % defaults.snapToGrid];
                    diffX -= (Math.abs(temp[0]) < defaults.snapToGrid/2 ? temp[2] : temp[2]-defaults.snapToGrid) + (temp[2] < 0 ? defaults.snapToGrid : 0);
                    diffY -= (Math.abs(temp[1]) < defaults.snapToGrid/2 ? temp[3] : temp[3]-defaults.snapToGrid) + (temp[3] < 0 ? defaults.snapToGrid : 0);

                    draw -= Math.abs(temp[0]) < defaults.snapToGrid/2 ? temp[0] : temp[0]-defaults.snapToGrid;
                    draw2 -= Math.abs(temp[1]) < defaults.snapToGrid/2 ? temp[1] : temp[1]-defaults.snapToGrid;

                    return [draw, draw2, diffX, diffY];
                }

                if(typeof draw === 'number'){
                    var temp = draw % defaults.snapToGrid;
                    return (draw -= temp < defaults.snapToGrid/2 ? temp : temp-defaults.snapToGrid);
                }

                if(draw.length){
                    var temp = [draw[0] % defaults.snapToGrid, draw[1] % defaults.snapToGrid];
                    draw[0] -= temp[0] < defaults.snapToGrid/2 ? temp[0] : temp[0]-defaults.snapToGrid;
                    draw[1] -= temp[1] < defaults.snapToGrid/2 ? temp[1] : temp[1]-defaults.snapToGrid;
                    return draw;
                }

                for(var i in draw){
                    var temp = draw[i] % defaults.snapToGrid;
                    draw[i] -= temp < defaults.snapToGrid/2 ? temp : temp-defaults.snapToGrid;
                }

                return draw;
            };*/

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