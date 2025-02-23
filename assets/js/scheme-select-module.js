import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
import { Module } from './data/module.js';

export class SchemeSelectModule extends Observer {

    constructor(canvas, schemeData) {
        super("SchemeSelectModule");
        this.canvas = canvas;
        this.schemeData = schemeData;
        this.typeModulesList = this.schemeData.typeModulesList;

        this.subscribe(this.schemeData.typeModulesList);

        this.backgroundLayer = new SchemeDesigner.Layer('background', { zIndex: 0, visible: false, active: false });
        this.defaultLayer = new SchemeDesigner.Layer('default', { zIndex: 10 });

        this.schemeDesigner = new SchemeDesigner.Scheme(this.canvas, {
            options: {
                cacheSchemeRatio: false
            },
            scroll: {
                draggable: true,
                draggableLeft: false,
                draggableTop: true,
                maxHiddenPart: 0.1,
            },
            zoom: {
                padding: -5,
                maxScale: 0,
                zoomCoefficient: 0
            },
            storage: {
                treeDepth: 0
            },
            event: {
                lockObjectMoving: true
            }
        });

        this.InitBackgroundLayer();
        this.InitDefaultLayer();
        this.schemeDesigner.addLayer(this.backgroundLayer);
        this.schemeDesigner.addLayer(this.defaultLayer);
        this.schemeDesigner.render();
        this.AddEvents();

    }

    update(publisher, typeModule, ...args) { // получаем данные от Субьекта (Publisher) и вызываем для них функцию-обработчик
        var objectData = this.typeModulesList.list[this.typeModulesList.list.length - 1];

        var width = 50;
        var height = 50;
        var leftOffset = this.canvas.width / 2;
        var topOffset = (height + 5) * (publisher.list.length - 1);
        var rotation = 0;

        var schemeObject = new SchemeDesigner.SchemeObject({
            /**
             * Required params
             */
            x: 0.5 + leftOffset,
            y: 0.5 + topOffset,
            width: width,
            height: height,
            active: true,
            cursorStyle: 'pointer',

            /**
             * Custom params (any names and count)
             */
            rotation: rotation,
            id: 'item_' + publisher.list.length,
            name: objectData.ObjectName,
            type: objectData,
            price: 0,
            seat: 0,
            row: 0,
            sectorName: 'select',
            fontSize: objectData.FontSize,
            backgroundColor: objectData.BackColor,
            fontColor: objectData.FontColor,
            isSelected: false,

            renderFunction: (schemeObject, schemeDesigner, view) => {
                var context = view.getContext();
                var objectParams = schemeObject.getParams();
                var backgroundColor = '#' + objectParams.BackgroundColor;
                context.beginPath();
                context.lineWidth = 1;
                context.strokeStyle = 'white';
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
                if (objectParams.type.imageUrl !== undefined && objectParams.type.imageUrl !== null) {
                    context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), relativeX, relativeY, width, height);
                }
                //context.stroke();
                context.fill();
                context.stroke();
            },
            clickFunction: (schemeObject, schemeDesigner, view, e) => {
                var objectParams = schemeObject.getParams();
                //objectParams.isSelected = !objectParams.isSelected;                
                let module = {
                    "id": "place_42_1_1",
                    "objectName": "Module",
                    "typeModulesGuid": "ECDAF8AB-9566-4085-B4AA-5A21B154F56B",
                    "width": "30",
                    "height": "50",
                    "seat": "2",
                    "cx": "60.0000",
                    "cx2": "110.0000",
                    "cy": "20.0000",
                    "cy2": "70.0000",
                    "angle": "0.00",
                    "fontColor": "",
                    "fontSize": "10",
                    "backColor": "FFCC66"
                };


                this.schemeData.modulesList.addModule(module);
                //this.schemeViewer.render();
            },

            clearFunction: function (schemeObject, schemeDesigner, view) {
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
        this.schemeDesigner.storageManager.applyStructureChange();
    }

    InitBackgroundLayer() {
        /**
        * add background object
        */
        this.backgroundLayer.addObject(new SchemeDesigner.SchemeObject({
            x: 0.5,
            y: 0.5,
            width: this.canvas.width,
            height: this.canvas.height,
            cursorStyle: 'default',
            renderFunction: function (schemeObject, schemeDesigner, view) {
                var context = view.getContext();
                context.beginPath();
                context.lineWidth = 4;
                context.strokeStyle = 'rgba(12, 200, 15, 0.2)';
                context.fillStyle = 'rgba(12, 200, 15, 0.2)';
                var width = schemeObject.width;
                var height = schemeObject.height;
                context.rect(schemeObject.x, schemeObject.y, width, height);
                context.fill();
                context.stroke();
            }
        }));
    }

    InitDefaultLayer() {
        /**
        * Creating places
        */
        let modules = this.typeModulesList;
        for (var i = 0; i < modules.list.length; i++) {
            var objectData = modules.list[i];

            var width = 50;
            var height = 50;
            var leftOffset = this.canvas.width / 2;
            var topOffset = (height + 5) * i;
            var rotation = 0;

            var schemeObject = new SchemeDesigner.SchemeObject({
                /**
                 * Required params
                 */
                x: 0.5 + leftOffset,
                y: 0.5 + topOffset,
                width: width,
                height: height,
                active: true,
                cursorStyle: 'pointer',
                /**
                 * Custom params (any names and count)
                 */
                rotation: rotation,
                id: 'item_' + i,
                name: objectData.name,
                type: objectData,
                price: 0,
                seat: 0,
                row: 0,
                sectorName: 'select',
                fontSize: objectData.FontSize,
                backgroundColor: objectData.BackColor,
                fontColor: objectData.FontColor,
                isSelected: false,
                renderFunction: (schemeObject, schemeDesigner, view) => {
                    var context = view.getContext();

                    var objectParams = schemeObject.getParams();
                    var backgroundColor = '#' + objectParams.BackgroundColor;
                    context.beginPath();
                    context.lineWidth = 0.5;
                    context.setLineDash([4, 5]);
                    context.strokeStyle = 'green';
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
                    if (objectParams.type.imageUrl !== undefined && objectParams.type.imageUrl !== null) {
                        context.strokeRect(relativeX, relativeY, width, height);
                        context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), relativeX, relativeY, width, height);
                    }
                    //context.stroke();
                    context.fill();
                    context.stroke();
                },

                clickFunction: (schemeObject, schemeDesigner, view, e) => {

                    var objectParams = schemeObject.getParams();

                    switch (objectParams.type.type.toLowerCase()) {
                        case "place":
                            this.schemeData.workspace.backgroundGuid = objectParams.type.guid;
                            break;
                        case "module":
                        case "technical":
                        case "landscape":
                        case "label":
                        default:
                            let newModule = new Module({
                                "name": objectParams.name,
                                "objectName": objectParams.type.type,
                                "typeModulesGuid": objectParams.type.guid,
                                "label": "",
                                "price": objectParams.price,
                                "left": 0,
                                "top": 0,
                                //"width": objectParams.width,
                                //"height": objectParams.height,
                                "width": 100,
                                "height": 100,
                                "angle": "0.00",
                                "fontColor": "",
                                "fontSize": "10",
                                "backColor": "FFCC66"
                            })
                            this.schemeData.modulesList.addModule(newModule);
                            break;

                    }
                },

                clearFunction: function (schemeObject, schemeDesigner, view) {
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
            //console.log('clickOnObject', e.detail);
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
    }
}