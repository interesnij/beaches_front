import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
import { TimeHelper } from './data/time-helper.js';
import { Draw } from './data/classes.js';
import { Booking } from './data/booking.js';

export class SchemeViewer extends Observer {

    constructor(canvas, schemeData) {
        super("SchemeViewer");
        this.canvas = canvas;
        this.schemeData = schemeData;

        this.subscribe(this.schemeData.bookingList);
        this.subscribe(this.schemeData.bookingSettings);

        this.backgroundLayer = new SchemeDesigner.Layer('background', { zIndex: 0, visible: true, active: false });
        this.gridLayer = new SchemeDesigner.Layer('grid', { zIndex: 5, visible: true, active: false });
        this.techLayer = new SchemeDesigner.Layer('tech', { zIndex: 10, visible: true, active: false });
        this.defaultLayer = new SchemeDesigner.Layer('default', { zIndex: 50 });

        this.typeModulesList = this.schemeData.typeModulesList;
        this.schemeDesigner = new SchemeDesigner.Scheme(this.canvas, this.schemeData.settings);

        this.InitBackgroundLayer(this.schemeData.workspace);
        this.InitGridLayer(this.schemeData.workspace);
        this.InitDefaultLayer();
        this.InitTechLayer();
        this.schemeDesigner.addLayer(this.backgroundLayer);
        this.schemeDesigner.addLayer(this.gridLayer);
        this.schemeDesigner.addLayer(this.techLayer);



        this.schemeDesigner.addLayer(this.defaultLayer);

        this.schemeDesigner.storageManager.applyStructureChange();
        //this.scheme.updateCache(true);
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
                //context.rect(schemeObject.x, schemeObject.y, width, height);
                context.drawImage(this.schemeData.imageStorage.getImage(this.schemeData.typeModulesList.list.find(item => item.guid == workspace.backgroundGuid)), schemeObject.x, schemeObject.y, width, height);
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


    InitTechLayer() {
        let modulesType = this.schemeData.typeModulesList.list.filter(element => {
            return element.type !== 'Module';
        });
        let modules = this.schemeData.modulesList.list.filter(element => {
            return modulesType.find(m => {
                return m.guid == element.typeModulesGuid;
            }) !== undefined;
        });
        for (var i = 0; i < modules.length; i++) {
            let moduleType = this.schemeData.typeModulesList.list.find(item => item.guid == modules[i].typeModulesGuid);
            var objectData = modules[i];
            switch (moduleType.type) {
                case "Label":
                    this.insertLabel(objectData);
                    break;
                default:
                    this.insertTech(objectData);
                    break;
            }

        }
    }

    InitDefaultLayer() {
        /**
        * Creating places
        */

        let modulesType = this.schemeData.typeModulesList.list.filter(element => {
            return element.type === 'Module';
        });
        let modules = this.schemeData.modulesList.list.filter(element => {
            return modulesType.find(m => {
                return m.guid == element.typeModulesGuid;
            }) !== undefined;
        });
        for (var i = 0; i < modules.length; i++) {
            var objectData = modules[i];
            this.insertModule(objectData);

        }

    }

    insertLabel(objectData) {
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
                var objectParams = schemeObject.getParams();
                var fontSize = (objectParams.fontSize >> 0) * (96 / 72) * 3;

                var context = view.getContext();

                context.fillStyle = '#' + objectParams.fontColor;
                context.font = fontSize + 'px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText(objectParams.label, schemeObject.getX(), schemeObject.getY());
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

        this.techLayer.addObject(schemeObject);
    }

    insertTech(objectData) {
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

        this.techLayer.addObject(schemeObject);
    }

    insertModule(objectData) {
        var leftOffset = objectData.left >> 0;
        var topOffset = objectData.top >> 0;
        var width = objectData.width >> 0;
        var height = objectData.height >> 0;
        var rotation = objectData.angle >> 0;
        var guid = objectData.guid;
        let typeModuleGuid = this.schemeData.typeModulesList.list.find(item => { return item.guid == objectData.typeModulesGuid });
        let booking = this.schemeData.bookingList.list.filter(item => { return item.moduleGuid == objectData.guid });
        let isBooking = false;
        let isMyBooking = false;
        let isSelected = false;

        booking.forEach(element => {
            if (TimeHelper.checkIntersection(this.schemeData.bookingSettings.getPeriod(), element.getPeriod())) {
                isBooking = true;
                isSelected = true;
                isMyBooking = element.isMyBooking;
            }
        });



        var schemeObject = new SchemeDesigner.SchemeObject({
            /**
             * Required params
             */
            x: 0.5 + leftOffset,
            y: 0.5 + topOffset,
            width: width,
            height: height,

            active: !isBooking || isMyBooking,
            cursorStyle: isBooking && !isMyBooking ? 'default' : 'pointer', //typeModule.Type == 'Module' ? 'pointer' : 'default',

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

            isSelected: isSelected,
            isBooking: isBooking,
            isMyBooking: isMyBooking,


            renderFunction: (schemeObject, schemeDesigner, view) => {
                var objectParams = schemeObject.getParams();
                if (objectParams.isMyBooking) this.renderModuleMyBooking(schemeObject, schemeDesigner, view);
                else
                    if (objectParams.isBooking) this.renderModuleBooking(schemeObject, schemeDesigner, view);
                    else
                        this.renderModule(schemeObject, schemeDesigner, view);

            },

            clickFunction: (schemeObject, schemeDesigner, view, e) => {

                var objectParams = schemeObject.getParams();

                //objectParams.isSelected = objectParams.isSelected ? false : true;

                objectParams.isMyBooking ?
                    this.clickFunctionRejectBooking(schemeObject, schemeDesigner, view, e) :
                    this.clickFunctionBooking(schemeObject, schemeDesigner, view, e);
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


    updateModule(schemeObject) {
        var objectParams = schemeObject.getParams();
        let booking = this.schemeData.bookingList.list.filter(item => { return item.moduleGuid == objectParams.guid });
        let isBooking = false;
        let isMyBooking = false;
        let isSelected = false;

        booking.forEach(element => {
            if (TimeHelper.checkIntersection(this.schemeData.bookingSettings.getPeriod(), element.getPeriod())) {
                isBooking = true;
                isSelected = true;
                isMyBooking = element.isMyBooking;
            }
        });

        objectParams.isBooking = isBooking;
        objectParams.isMyBooking = isMyBooking;
        objectParams.isSelected = isSelected;
        schemeObject.active = !isBooking || isMyBooking;
        schemeObject.cursorStyle = isBooking && !isMyBooking ? 'default' : 'pointer'; //typeModule.Type == 'Module' ? 'pointer' : 'default',        
    }


    clickFunctionBooking(schemeObject, schemeDesigner, view, e) {
        var objectParams = schemeObject.getParams();

        this.schemeData.bookingList.addBookingItem({
            moduleGuid: objectParams.guid,
            date: this.schemeData.bookingSettings.date,
            timeStart: TimeHelper.stringTime(this.schemeData.bookingSettings.timeStart),
            timeEnd: TimeHelper.stringTime(this.schemeData.bookingSettings.timeEnd),
            isMyBooking: true
        });
        //objectParams.isMyBooking = true;
    }

    clickFunctionRejectBooking(schemeObject, schemeDesigner, view, e) {
        var objectParams = schemeObject.getParams();
        this.schemeData.bookingList.removeBookingItem(
            this.schemeData.bookingList.list.find(element => {
                return (element.moduleGuid == objectParams.guid &&
                    TimeHelper.checkIntersection(this.schemeData.bookingSettings.getPeriod(), element.getPeriod()))
            })
        );
        //objectParams.isMyBooking = false;
    }

    renderModuleMyBooking(schemeObject, schemeDesigner, view) {
        var context = view.getContext();
        var objectParams = schemeObject.getParams();
        var backgroundColor = '#' + objectParams.BackgroundColor;
        context.beginPath();
        context.setLineDash([3, 4]);
        context.lineWidth = 2;
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
            context.fillStyle = 'green';
        } else if (isHovered) {
            context.fillStyle = backgroundColor;
        } else if (objectParams.isSelected) {
            context.fillStyle = 'green';
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
    }

    renderModuleBooking(schemeObject, schemeDesigner, view) {
        var context = view.getContext();
        var objectParams = schemeObject.getParams();
        var backgroundColor = '#' + objectParams.BackgroundColor;
        context.beginPath();
        context.setLineDash([3, 4]);
        context.lineWidth = 2;
        context.strokeStyle = 'red';
        context.fillStyle = backgroundColor;


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
            context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), -halfWidth, -halfHeight, width, height);
        } else {
            context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), relativeX, relativeY, width, height);
        }
        context.fill();
        context.stroke();

        context.font = (Math.floor((schemeObject.getWidth() + schemeObject.getHeight()) / 4)) + 'px Arial';


        var context = view.getContext();
        var objectParams = schemeObject.getParams();
        var backgroundColor = '#' + objectParams.BackgroundColor;
        context.beginPath();
        context.lineWidth = 2;
        context.fillStyle = 'rgba(109, 1, 1, 0.82)';
        context.strokeStyle = 'rgba(109, 1, 1, 0.82)';


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
            context.strokeRect(-halfWidth, -halfHeight, width, height);
            context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), -halfWidth, -halfHeight, width, height);

        } else {
            context.strokeRect(relativeX, relativeY, width, height);
            context.drawImage(this.schemeData.imageStorage.getImage(objectParams.type), relativeX, relativeY, width, height);

            //context.stroke();

        }
        context.fill();
        context.stroke();

        context.font = (Math.floor((schemeObject.getWidth() + schemeObject.getHeight()) / 4)) + 'px Arial';


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



        if (schemeObject.rotation) {
            context.restore();
        }
    }

    renderModule(schemeObject, schemeDesigner, view) {
        var context = view.getContext();
        var objectParams = schemeObject.getParams();
        var backgroundColor = '#' + objectParams.BackgroundColor;
        context.beginPath();
        context.setLineDash([3, 4]);
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
    }

    AddEvents() {
        /**
         * Add events
         */
        this.canvas.addEventListener('schemeDesigner.beforeRenderAll', function (e) {
            console.time('renderAll');
        }, false);

        this.canvas.addEventListener('schemeDesigner.afterRenderAll', function (e) {
            console.timeEnd('renderAll');
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

        this.canvas.addEventListener('keydown', function (e) {
            var code = e.key;
            console.log(e);
            /*
            switch (code) {
                case 37: alert("Left"); break; //Left key
                case 38: alert("Up"); break; //Up key
                case 39: alert("Right"); break; //Right key
                case 40: alert("Down"); break; //Down key
                default: alert(code); //Everything else
            }
                */
        }, false);
    }

    update(publisher, action, booking, ...args) {
        console.log(publisher);
        switch (action) {
            case 'updateBookingSettings':
                this.defaultLayer.getObjects().forEach(element => {
                    this.updateModule(element);
                });
                break;
            case 'insertBooking':
            case 'deleteBooking':
            case 'updateBooking':
            default:
                let schemeObjects = this.defaultLayer.getObjects()
                let schemeObject = schemeObjects.find(element => {
                    let objectParams = element.getParams();
                    return objectParams.guid == booking.moduleGuid;
                });
                this.updateModule(schemeObject);
                break;

        }
        this.schemeDesigner.renderAll();
    }
}