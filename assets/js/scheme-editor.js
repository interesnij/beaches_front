import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
export class SchemeEditor extends Observer {
    constructor(canvas, schemeData) {
        super("SchemeEditor");
        this.canvas = canvas;
        this.schemeData = schemeData;
        this.subscribe(this.schemeData.modulesList);
        //this.subscribe(this.schemeData.settings);
        this.subscribe(this.schemeData.workspace);


        this.backgroundLayer = new SchemeDesigner.Layer('background', { zIndex: 0, visible: true, active: false });
        this.gridLayer = new SchemeDesigner.Layer('grid', { zIndex: 5, visible: true, active: false });
        this.defaultLayer = new SchemeDesigner.Layer('default', { zIndex: 10 });

        this.typeModulesList = this.schemeData.typeModulesList;
        this.schemeDesigner = new SchemeDesigner.Scheme(this.canvas, this.schemeData.settings);


        this.InitBackgroundLayer(this.schemeData.workspace);
        this.InitGridLayer(this.schemeData.workspace);
        this.InitDefaultLayer();
        this.schemeDesigner.addLayer(this.backgroundLayer);
        this.schemeDesigner.addLayer(this.gridLayer);
        this.schemeDesigner.addLayer(this.defaultLayer);
        this.schemeDesigner.render();
        this.AddEvents();

    }

    InitBackgroundLayer(workspace) {
        /**
        * add background object
        */
        this.backgroundLayer.addObject(new SchemeDesigner.SchemeObject({
            x: 0.5,
            y: 0.5,
            width: workspace.width, //this.canvas.scrollWidth,
            height: workspace.height,//this.canvas.scrollHeight,
            cursorStyle: 'default',
            renderFunction: (schemeObject, schemeDesigner, view) => {
                var context = view.getContext();
                context.beginPath();
                context.lineWidth = 4;
                context.strokeStyle = 'rgba(12, 200, 15, 0.2)';
                context.fillStyle = 'rgba(12, 200, 15, 0.2)';
                var width = schemeObject.width;
                var height = schemeObject.height;
                context.rect(schemeObject.x, schemeObject.y, width, height);
                //context.drawImage(this.schemeData.imageStorage.getImage(this.schemeData.typeModulesList.list.find(item => item.guid == workspace.backgroundGuid)), schemeObject.x, schemeObject.y, width, height);
                context.fill();
                context.stroke();
            }
        }));
    }


    InitGridLayer(workspace) {
        /**
        * add background object
        */
        this.gridLayer.addObject(new SchemeDesigner.SchemeObject({
            x: 0.5,
            y: 0.5,
            width: workspace.width, //this.canvas.scrollWidth,
            height: workspace.height,//this.canvas.scrollHeight,
            cursorStyle: 'default',
            renderFunction: (schemeObject, schemeDesigner, view) => {
                var context = view.getContext();
                context.beginPath();
                context.font = "24px serif";
                context.lineWidth = 2;
                context.strokeStyle = 'rgba(98, 18, 194, 0.3)';
                context.fillStyle = 'rgba(12, 200, 15, 0.5)';
                context.lineDashOffset = 5;
                context.setLineDash([3, 9]);
                var width = schemeObject.width;
                var height = schemeObject.height;
                let step = width / 50;
                let i1 = 0;
                for (let i = 0; i < width; i = i + step) {
                    context.fillText(i1, i, -20);
                    context.moveTo(i, 0);
                    context.lineTo(i, height);
                    i1++;
                }
                let i2 = 1;
                for (let j = step; j < height; j = j + step) {
                    context.fillText(i2, -30, j);
                    context.moveTo(0, j);
                    context.lineTo(width, j);
                    i2++;
                }
                context.fillText("Масштаб - " + step + "px", 10, height + 50);
                //context.rect(schemeObject.x, schemeObject.y, width, height / 3);
                //context.fill();
                context.stroke();
            }
        }));
    }

    InitDefaultLayer() {
        /**
        * Creating places
        */
        let modules = this.schemeData.modulesList;
        for (var i = 0; i < modules.list.length; i++) {
            var objectData = modules.list[i];
            this.insertModule(objectData);

        }

    }

    insertModule(objectData) {
        var leftOffset = objectData.left >> 0;
        var topOffset = objectData.top >> 0;
        var width = objectData.width >> 0;
        var height = objectData.height >> 0;
        var rotation = objectData.angle >> 0;
        var guid = objectData.guid;
        let typeModuleGuid = this.schemeData.typeModulesList.list.find(item => item.guid == objectData.typeModulesGuid);


        var schemeObject = new SchemeDesigner.SchemeObject({
            /**
             * Required params
             */
            x: 0.5 + leftOffset,
            y: 0.5 + topOffset,
            width: width,
            height: height,
            active: true, //typeModule.Type == 'Module' ? true : false,
            cursorStyle: 'pointer', //typeModule.Type == 'Module' ? 'pointer' : 'default',

            /**
             * Custom params (any names and count)
             */
            rotation: rotation,
            guid: guid,
            name: objectData.objectName,
            type: typeModuleGuid,
            price: objectData.price,
            label: objectData.label,
            fontSize: objectData.fontSize,
            backgroundColor: objectData.backColor,
            fontColor: objectData.fontColor,

            isSelected: false,


            renderFunction: (schemeObject, schemeDesigner, view) => {
                var context = view.getContext();
                var objectParams = schemeObject.getParams();
                var backgroundColor = '#' + objectParams.BackgroundColor;
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = 'red';
                var isHovered = schemeObject.isHovered && !SchemeDesigner.Tools.touchSupported();
                context.fillStyle = backgroundColor;

                if (objectParams.isSelected && isHovered) {
                    context.strokeStyle = backgroundColor;
                } else if (isHovered) {
                    context.fillStyle = 'white';
                    context.strokeStyle = backgroundColor;
                } else if (objectParams.isSelected) {
                    context.strokeStyle = backgroundColor;
                }


                var relativeX = schemeObject.x;
                var relativeY = schemeObject.y;

                var width = schemeObject.getWidth();
                var height = schemeObject.getHeight();

                var halfWidth = width / 2;
                var halfHeight = height / 2;

                if (schemeObject.getRotation()) {
                    context.save();
                    context.translate(relativeX + halfWidth, relativeY + halfHeight);
                    context.rotate(schemeObject.getRotation() * Math.PI / 180);
                    if (isHovered || objectParams.isSelected) { context.strokeRect(-halfWidth, -halfHeight, width, height); }
                    context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), -halfWidth, -halfHeight, width, height);
                } else {
                    if (isHovered || objectParams.isSelected) { context.strokeRect(relativeX, relativeY, width, height); }
                    context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), relativeX, relativeY, width, height);
                    //context.stroke();

                }
                context.fill();
                context.stroke();

                context.font = (Math.floor((schemeObject.getWidth() + schemeObject.getHeight()) / 4)) + 'px Arial';

                if (objectParams.isSelected && isHovered) {
                    context.fillStyle = 'red';
                } else if (isHovered) {
                    context.fillStyle = backgroundColor;
                } else if (objectParams.isSelected) {
                    context.fillStyle = 'red';
                }

                if (objectParams.isSelected || isHovered) {
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';

                    if (schemeObject.rotation) {
                        context.fillText(objectParams.label,
                            -(schemeObject.getWidth() / 2) + (schemeObject.getWidth() / 2),
                            -(schemeObject.getHeight() / 2) + (schemeObject.getHeight() / 2)
                        );
                    } else {
                        context.fillText(objectParams.label, relativeX + (schemeObject.getWidth() / 2), relativeY + (schemeObject.getHeight() / 2));
                    }

                }

                if (schemeObject.rotation) {
                    context.restore();
                }
            },

            clickFunction: (schemeObject, schemeDesigner, view, e) => {

                var objectParams = schemeObject.getParams();

                let objects = schemeDesigner.storageManager.getVisibleObjects()
                    .filter(element => {
                        return element.id != schemeObject.id;
                    });

                objects.forEach(element => {
                    let params = element.getParams();
                    params.isSelected = false;
                });

                objectParams.isSelected = objectParams.isSelected ? false : true;
                this.schemeData.modulesList.list
                    .forEach(element => {
                        element.guid == objectParams.guid ? element.isSelected = objectParams.isSelected : element.isSelected = false;
                    });

            },

            mouseDownFunction: (schemeObject, schemeDesigner, view, e) => {
                console.log("mouseDownFunction");
            },


            mouseUpFunction: (schemeObject, schemeDesigner, view, e) => {
                console.log("mouseUpFunction");
            },


            mouseMoveFunction: (schemeObject, schemeDesigner, view, e) => {
                console.log("mouseMoveFunction");
            },

            clearFunction: (schemeObject, schemeDesigner, view) => {
                var context = view.getContext();

                var borderWidth = 5;
                context.clearRect(schemeObject.x - borderWidth,
                    schemeObject.y - borderWidth,
                    this.width + (borderWidth * 2),
                    this.height + (borderWidth * 2)
                );
            }
        });

        this.defaultLayer.addObject(schemeObject);

    }



    deleteModule(module) {
        //TODO реализовать
        let schemeObjects = this.schemeDesigner.storageManager.getVisibleObjects();
        let schemeObject = schemeObjects.find(element => {
            return element.getParams().guid == module.guid;
        });
        this.defaultLayer.removeObject(schemeObject);
        this.schemeDesigner.storageManager.applyStructureChange();
    }

    updateModule(module) {
        let schemeObjects = this.schemeDesigner.storageManager.getVisibleObjects();
        let schemeObject = schemeObjects.find(element => {
            return element.getParams().guid == module.guid;
        });
        let schemeObjectParams = schemeObject.getParams();
        if (schemeObjectParams.rotation != module.angle) schemeObject.setRotation(module.angle);
        if (schemeObjectParams.x != module.left) schemeObject.setX(module.left);
        if (schemeObjectParams.y != module.top) schemeObject.setY(module.top);
        if (schemeObjectParams.width != module.width) schemeObject.setWidth(module.width);
        if (schemeObjectParams.height != module.height) schemeObject.setHeight(module.height);
        if (schemeObjectParams.label != module.label) schemeObjectParams.label = module.label;
        if (schemeObjectParams.name != module.name) schemeObjectParams.name = module.name;


        this.schemeDesigner.storageManager.applyStructureChange();
    }

    update(publisher, action, module, ...args) {

        switch (action) {
            case 'insertModule':
                this.insertModule(module);
                this.schemeDesigner.storageManager.applyStructureChange();
                break;
            case 'deleteModule':
                this.deleteModule(module);
                break;
            case 'updateModule':
                this.updateModule(module);
                break;
            case 'background':
                this.schemeDesigner.storageManager.applyStructureChange();
                break;
            default:
                break;
        }
    }


    AddEvents() {
        /**
         * Add events
         */
        this.canvas.addEventListener('schemeDesigner.beforeRenderAll', function (e) {
            //console.time('renderAll');
        }, false);

        this.canvas.addEventListener('schemeDesigner.afterRenderAll', function (e) {
            //console.timeEnd('renderAll');
        }, false);

        this.canvas.addEventListener('schemeDesigner.clickOnObject', function (e) {
            console.log('clickOnObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mousedown', function (e) {
            console.log('clickOnObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseup', function (e) {
            console.log('clickOnObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseOverObject', function (e) {
            //console.log('mouseOverObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseLeaveObject', function (e) {
            //console.log('mouseLeaveObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.scroll', function (e) {
            //console.log('scroll', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.zoom', function (e) {
            //console.log('zoom', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseDownOnObject', function (e) {
            console.log('mouseDownOnObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseMoveOnObject', function (e) {
            //console.log('mouseMoveOnObject', e.detail);
        }, false);

        this.canvas.addEventListener('schemeDesigner.mouseUpOnObject', (e) => {
            console.log('mouseUpOnObject', e);
            let params = e.detail.getParams();
            let module = this.schemeData.modulesList.list.find(element => { return element.guid == params.guid });

            module.setCoordinates(e.detail.x, e.detail.y);
            console.log('mouseUpOnObject', module);
        }, false);

        document.addEventListener('keydown', (e) => {
            //target: canvas#scheme-canvas            
            if (e.target == this.canvas) {

                if (this.schemeData.modulesList.findSelected() !== undefined) {
                    if (e.keyCode == 46) {
                        //console.log(this.schemeData.modulesList.findSelected());
                        //console.log(e);
                        this.schemeData.modulesList.removeModule(this.schemeData.modulesList.findSelected());
                    }
                }
            }
        }, false);

    }

}