// svg.resize.js 0.1.0 - Copyright (c) 2014 Urich-Matthias Schäfer - Licensed under the MIT license

// TODO: Maybe use nested SVG instead of group to avoid translation when moving

;(function() {

    SVG.extend(SVG.Element, {
        // Resize element with mouse
        resize: function(options) {

            var resize, update, done, calc, defaults
                , element = this;

            defaults = {
                //TODO: snapToGrid
            };

            for(var i in options){
                if(!defaults[i])throw('Property '+i+'doesn\'t exists');
                defaults[i] = options[i];
            }

            resize = function(event){

                element.startParams = {x:event.detail.x, y:event.detail.y, box:element.bbox()};

                switch(event.type){
                    case 'lt':
                        calc = function(diffX, diffY){
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

            this.on('lt', resize);
            this.on('rt', resize);
            this.on('rb', resize);
            this.on('lb', resize);

            this.on('t', resize);
            this.on('r', resize);
            this.on('b', resize);
            this.on('l', resize);

        }

    });

}).call(this);