var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Layer class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class Layer {
        /**
         * Constructor
         * @param id
         * @param {Object} params
         */
        constructor(id, params) {
            /**
             * Z index
             */
            this.zIndex = 0;
            /**
             * Is active
             */
            this.active = true;
            /**
             * Is visible
             */
            this.visible = true;
            /**
             * Objects
             */
            this.objects = [];
            if (id.length == 0) {
                throw new Error('Empty layer id');
            }
            this.id = id;
            SchemeDesigner.Tools.configure(this, params);
        }
        /**
         * Need to rebuild manually tree by calling requestBuildTree()
         * Remove object
         * @param {SchemeObject} object
         */
        removeObject(object) {
            this.objects = this.objects.filter(existObject => existObject !== object);
        }
        /**
         * Remove all objects
         */
        removeObjects() {
            this.objects = [];
        }
        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        getObjects() {
            return this.objects;
        }
        /**
         * Add object
         * @param {SchemeObject} object
         */
        addObject(object) {
            object.setLayerId(this.id);
            this.objects.push(object);
        }
        /**
         * Set zIndex
         * @param {number} value
         */
        setZIndex(value) {
            this.zIndex = value;
        }
        /**
         * Set active
         * @param {boolean} value
         */
        setActive(value) {
            this.active = value;
        }
        /**
         * Set visible
         * @param {boolean} value
         */
        setVisible(value) {
            this.visible = value;
        }
        /**
         * Get is visible
         * @return {boolean}
         */
        isVisible() {
            return this.visible;
        }
        /**
         * Get is active
         * @return {boolean}
         */
        isActive() {
            return this.active;
        }
        /**
         * Get z index
         * @return {boolean}
         */
        getZIndex() {
            return this.zIndex;
        }
        /**
         * Get id
         * @return {string}
         */
        getId() {
            return this.id;
        }
    }
    SchemeDesigner.Layer = Layer;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class Scheme {
        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas, params) {
            /**
             * Current number of rendering request
             */
            this.renderingRequestId = 0;
            /**
             * Device Pixel Ratio
             */
            this.devicePixelRatio = 1;
            /**
             * Default cursor style
             */
            this.defaultCursorStyle = 'default';
            /**
             * Ratio for cache scheme
             */
            this.cacheSchemeRatio = 2;
            this.cacheOnHover = true;
            /**
             * Bacground color
             */
            this.background = null;
            /**
             * Changed objects
             */
            this.changedObjects = [];
            this.requestFrameAnimation = SchemeDesigner.Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = SchemeDesigner.Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = SchemeDesigner.Polyfill.getDevicePixelRatio();
            if (params) {
                SchemeDesigner.Tools.configure(this, params.options);
            }
            this.view = new SchemeDesigner.View(canvas, this.background);
            /**
             * Managers
             */
            this.scrollManager = new SchemeDesigner.ScrollManager(this);
            this.zoomManager = new SchemeDesigner.ZoomManager(this);
            this.eventManager = new SchemeDesigner.EventManager(this);
            this.mapManager = new SchemeDesigner.MapManager(this);
            this.storageManager = new SchemeDesigner.StorageManager(this);
            /**
             * Configure
             */
            if (params) {
                SchemeDesigner.Tools.configure(this.scrollManager, params.scroll);
                SchemeDesigner.Tools.configure(this.zoomManager, params.zoom);
                SchemeDesigner.Tools.configure(this.mapManager, params.map);
                SchemeDesigner.Tools.configure(this.storageManager, params.storage);
                SchemeDesigner.Tools.configure(this.eventManager, params.event);
            }
            /**
             * Disable selections on canvas
             */
            SchemeDesigner.Tools.disableElementSelection(this.view.getCanvas());
            /**
             * Set dimensions
             */
            this.resize();
        }
        /**
         * Resize canvas
         */
        resize() {
            this.view.resize();
            this.mapManager.resize();
            this.zoomManager.resetScale();
        }
        /**
         * Get event manager
         * @returns {EventManager}
         */
        getEventManager() {
            return this.eventManager;
        }
        /**
         * Get scroll manager
         * @returns {ScrollManager}
         */
        getScrollManager() {
            return this.scrollManager;
        }
        /**
         * Get zoom manager
         * @returns {ZoomManager}
         */
        getZoomManager() {
            return this.zoomManager;
        }
        /**
         * Get storage manager
         * @returns {StorageManager}
         */
        getStorageManager() {
            return this.storageManager;
        }
        /**
         * Get map manager
         * @returns {MapManager}
         */
        getMapManager() {
            return this.mapManager;
        }
        /**
         * Get width
         * @returns {number}
         */
        getWidth() {
            return this.view.getWidth();
        }
        /**
         * Get height
         * @returns {number}
         */
        getHeight() {
            return this.view.getHeight();
        }
        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        requestFrameAnimationApply(animation) {
            return this.requestFrameAnimation.call(window, animation);
        }
        /**
         * Cancel animation
         * @param requestId
         */
        cancelAnimationFrameApply(requestId) {
            return this.cancelFrameAnimation.call(window, requestId);
        }
        /**
         * Clear canvas context
         */
        clearContext() {
            let context = this.view.getContext();
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, this.getWidth(), this.getHeight());
            context.restore();
            return this;
        }
        /**
         * Request render all
         */
        requestRenderAll() {
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(() => {
                    this.renderAll();
                });
            }
            return this;
        }
        /**
         * Render scheme
         */
        render() {
            /**
             * Create tree index
             */
            this.storageManager.getTree();
            /**
             * Set scheme to center with scale for all objects
             */
            this.zoomManager.setScale(this.zoomManager.getScaleWithAllObjects());
            this.scrollManager.toCenter();
            this.updateCache(false);
            this.requestDrawFromCache();
        }
        /**
         * Get visible bounding rect
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        getVisibleBoundingRect() {
            let scale = this.zoomManager.getScale();
            let width = this.getWidth() / scale;
            let height = this.getHeight() / scale;
            let leftOffset = -this.scrollManager.getScrollLeft() / scale;
            let topOffset = -this.scrollManager.getScrollTop() / scale;
            return {
                left: leftOffset,
                top: topOffset,
                right: leftOffset + width,
                bottom: topOffset + height
            };
        }
        /**
         * Render visible objects
         */
        renderAll() {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }
            this.eventManager.sendEvent('beforeRenderAll');
            this.clearContext();
            this.view.drawBackground();
            let visibleBoundingRect = this.getVisibleBoundingRect();
            let nodes = this.storageManager.findNodesByBoundingRect(null, visibleBoundingRect);
            let layers = this.storageManager.getSortedLayers();
            let renderedObjectIds = {};
            for (let layer of layers) {
                for (let node of nodes) {
                    for (let schemeObject of node.getObjectsByLayer(layer.getId())) {
                        let objectId = schemeObject.getId();
                        if (typeof renderedObjectIds[objectId] !== 'undefined') {
                            continue;
                        }
                        renderedObjectIds[objectId] = true;
                        schemeObject.render(this, this.view);
                    }
                }
            }
            this.mapManager.drawMap();
            this.eventManager.sendEvent('afterRenderAll');
        }
        /**
         * Add layer
         * @param layer
         */
        addLayer(layer) {
            this.storageManager.addLayer(layer);
        }
        /**
         * Remove layer
         * @param layerId
         */
        removeLayer(layerId) {
            this.storageManager.removeLayer(layerId);
        }
        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        getCanvas() {
            return this.view.getCanvas();
        }
        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        setCursorStyle(cursor) {
            this.view.getCanvas().style.cursor = cursor;
            return this;
        }
        /**
         * Get default cursor style
         * @returns {string}
         */
        getDefaultCursorStyle() {
            return this.defaultCursorStyle;
        }
        /**
         * Draw from cache
         * @returns {boolean}
         */
        drawFromCache() {
            if (!this.cacheView) {
                return false;
            }
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }
            this.clearContext();
            let boundingRect = this.storageManager.getObjectsBoundingRect();
            this.view.drawBackground();
            this.view.getContext().drawImage(this.cacheView.getCanvas(), 0, 0, boundingRect.right, boundingRect.bottom);
            this.mapManager.drawMap();
            return true;
        }
        /**
         * Request draw from cache
         * @returns {Scheme}
         */
        requestDrawFromCache() {
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(() => {
                    this.drawFromCache();
                });
            }
            return this;
        }
        /**
         * Update scheme cache
         * @param onlyChanged
         */
        updateCache(onlyChanged) {
            if (!this.cacheView) {
                let storage = this.storageManager.getImageStorage('scheme-cache');
                this.cacheView = new SchemeDesigner.View(storage.getCanvas(), this.background);
            }
            if (onlyChanged) {
                for (let schemeObject of this.changedObjects) {
                    let layer = this.storageManager.getLayerById(schemeObject.getLayerId());
                    if (layer instanceof SchemeDesigner.Layer && layer.isVisible()) {
                        schemeObject.clear(this, this.cacheView);
                        schemeObject.render(this, this.cacheView);
                    }
                }
            }
            else {
                let boundingRect = this.storageManager.getObjectsBoundingRect();
                let scale = (1 / this.zoomManager.getScaleWithAllObjects()) * this.cacheSchemeRatio;
                let rectWidth = boundingRect.right * scale;
                let rectHeight = boundingRect.bottom * scale;
                this.cacheView.setDimensions({
                    width: rectWidth,
                    height: rectHeight
                });
                this.cacheView.getContext().scale(scale, scale);
                this.cacheView.drawBackground();
                let layers = this.storageManager.getSortedLayers();
                for (let layer of layers) {
                    for (let schemeObject of layer.getObjects()) {
                        schemeObject.render(this, this.cacheView);
                    }
                }
            }
            this.changedObjects = [];
        }
        /**
         * Add changed object
         * @param schemeObject
         */
        addChangedObject(schemeObject) {
            this.changedObjects.push(schemeObject);
        }
        /**
         * Set cacheSchemeRatio
         * @param value
         */
        setCacheSchemeRatio(value) {
            this.cacheSchemeRatio = value;
        }
        /**
         * get cacheSchemeRatio
         * @returns {number}
         */
        getCAcheSchemeRatio() {
            return this.cacheSchemeRatio;
        }
        /**
         * Set cacheOnHover
         * @param value
         */
        setCacheOnHover(value) {
            this.cacheOnHover = value;
        }
        /**
         * get cacheOnHover
         * @returns {boolean}
         */
        getCacheOnHover() {
            return this.cacheOnHover;
        }
        /**
         * Use scheme from cache
         * @returns {boolean}
         */
        useSchemeCache() {
            let objectsDimensions = this.storageManager.getObjectsDimensions();
            let ratio = (objectsDimensions.width * this.zoomManager.getScale()) / this.getWidth();
            if (this.cacheSchemeRatio && ratio <= this.cacheSchemeRatio) {
                return true;
            }
            return false;
        }
        /**
         * Get view
         * @returns {View}
         */
        getView() {
            return this.view;
        }
        /**
         * Get cache view
         * @returns {View}
         */
        getCacheView() {
            return this.cacheView;
        }
        /**
         * Set background
         * @param value
         */
        setBackground(value) {
            this.background = value;
        }
        /**
         * Get background
         * @returns {string|null}
         */
        getBackground() {
            return this.background;
        }
    }
    SchemeDesigner.Scheme = Scheme;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * SchemeObject class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class SchemeObject {
        /**
         * Constructor
         * @param {Object} params
         */
        constructor(params) {
            /**
             * Is active
             */
            this.active = true;
            /**
             * Rotation
             */
            this.rotation = 0;
            /**
             * Is hovered
             */
            this.isHovered = false;
            /**
             * Cursor style
             */
            this.cursorStyle = 'pointer';
            /**
             * Render function
             */
            this.renderFunction = function () { };
            /**
             * Clear function
             */
            this.clearFunction = function () { };
            this.id = SchemeDesigner.Tools.generateUniqueId();
            SchemeDesigner.Tools.configure(this, params);
            this.params = params;
        }
        /**
         * Set layer id
         * @param {string} layerId
         */
        setLayerId(layerId) {
            this.layerId = layerId;
        }
        /**
         * Get layer id
         * @return {string}
         */
        getLayerId() {
            return this.layerId;
        }
        /**
         * Get id
         * @returns {number}
         */
        getId() {
            return this.id;
        }
        /**
         * Get x
         * @returns {number}
         */
        getX() {
            return this.x;
        }
        /**
         * Get y
         * @returns {number}
         */
        getY() {
            return this.y;
        }
        /**
         * Get width
         * @returns {number}
         */
        getWidth() {
            return this.width;
        }
        /**
         * Get height
         * @returns {number}
         */
        getHeight() {
            return this.height;
        }
        /**
         * Get params
         * @return {any}
         */
        getParams() {
            return this.params;
        }
        /**
         * Rendering object
         * @param scheme
         * @param view
         */
        render(scheme, view) {
            this.renderFunction(this, scheme, view);
        }
        /**
         * Clear object
         * @param scheme
         * @param view
         */
        clear(scheme, view) {
            this.clearFunction(this, scheme, view);
        }
        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        click(e, schemeDesigner, view) {
            if (typeof this.clickFunction === 'function') {
                return this.clickFunction(this, schemeDesigner, view, e);
            }
            return null;
        }
        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        mouseOver(e, schemeDesigner, view) {
            if (typeof this.mouseOverFunction === 'function') {
                return this.mouseOverFunction(this, schemeDesigner, view, e);
            }
            return null;
        }
        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        mouseLeave(e, schemeDesigner, view) {
            if (typeof this.mouseLeaveFunction === 'function') {
                return this.mouseLeaveFunction(this, schemeDesigner, view, e);
            }
            return null;
        }
        /**
         * Check point in object
         * @param point
         * @param schemeDesigner
         * @param view
         * @return boolean
         */
        checkPointInObject(point, schemeDesigner, view) {
            if (typeof this.pointInObjectFunction === 'function') {
                return this.pointInObjectFunction(this, point, schemeDesigner, view);
            }
            return true;
        }
        /**
         * Set x
         * @param {number} value
         */
        setX(value) {
            this.x = value;
        }
        /**
         * Set y
         * @param {number} value
         */
        setY(value) {
            this.y = value;
        }
        /**
         * Set width
         * @param {number} value
         */
        setWidth(value) {
            this.width = value;
        }
        /**
         * Set height
         * @param {number} value
         */
        setHeight(value) {
            this.height = value;
        }
        /**
         * Set cursorStyle
         * @param {string} value
         */
        setCursorStyle(value) {
            this.cursorStyle = value;
        }
        /**
         * Set rotation
         * @param {number} value
         */
        setRotation(value) {
            this.rotation = value;
        }
        /**
         * Set renderFunction
         * @param {Function} value
         */
        setRenderFunction(value) {
            this.renderFunction = value;
        }
        /**
         * Set clickFunction
         * @param {Function} value
         */
        setClickFunction(value) {
            this.clickFunction = value;
        }
        /**
         * Set clearFunction
         * @param {Function} value
         */
        setClearFunction(value) {
            this.clearFunction = value;
        }
        /**
         * Set mouseOverFunction
         * @param {Function} value
         */
        setMouseOverFunction(value) {
            this.mouseOverFunction = value;
        }
        /**
         * Set mouseLeaveFunction
         * @param {Function} value
         */
        setMouseLeaveFunction(value) {
            this.mouseLeaveFunction = value;
        }
        /**
         * Set pointInObjectFunction
         * @param {Function} value
         */
        setPointInObjectFunction(value) {
            this.pointInObjectFunction = value;
        }
        /**
         * Bounding rect
         * @returns BoundingRect
         */
        getBoundingRect() {
            return {
                left: this.x,
                top: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            };
        }
        /**
         * Outer bound rect
         * @returns {BoundingRect}
         */
        getOuterBoundingRect() {
            let boundingRect = this.getBoundingRect();
            if (!this.rotation) {
                return boundingRect;
            }
            // rotate from center
            let rectCenterX = (boundingRect.left + boundingRect.right) / 2;
            let rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;
            let axis = { x: rectCenterX, y: rectCenterY };
            let leftTop = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x, y: this.y }, axis, this.rotation);
            let leftBottom = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x, y: this.y + this.height }, axis, this.rotation);
            let rightTop = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x + this.width, y: this.y }, axis, this.rotation);
            let rightBottom = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x + this.width, y: this.y + this.height }, axis, this.rotation);
            return {
                left: Math.min(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                top: Math.min(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
                right: Math.max(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                bottom: Math.max(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
            };
        }
        /**
         * Get rotation
         * @returns {number}
         */
        getRotation() {
            return this.rotation;
        }
        /**
         * Get is active
         * @return {boolean}
         */
        isActive() {
            return this.active;
        }
        /**
         * Set active
         * @param {boolean} value
         */
        setActive(value) {
            this.active = value;
        }
    }
    SchemeDesigner.SchemeObject = SchemeObject;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * ImageStorage
     */
    class ImageStorage {
        /**
         * Constructor
         * @param id
         * @param scheme
         */
        constructor(id, scheme) {
            this.id = 'scheme-designer-image-storage-' + SchemeDesigner.Tools.getRandomString() + '-' + id;
            this.scheme = scheme;
            let canvas = document.getElementById(id);
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = this.id;
                canvas.style.display = 'none';
                this.scheme.getCanvas().parentNode.appendChild(canvas);
            }
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
        }
        /**
         * Set image data
         * @param imageData
         * @param width
         * @param height
         */
        setImageData(imageData, width, height) {
            this.setDimensions({ width: width, height: height });
            this.context.putImageData(imageData, 0, 0);
        }
        /**
         * Set dimensions
         * @param dimensions
         */
        setDimensions(dimensions) {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
        }
        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        getCanvas() {
            return this.canvas;
        }
        /**
         * Get context
         * @returns {CanvasRenderingContext2D}
         */
        getContext() {
            return this.context;
        }
    }
    SchemeDesigner.ImageStorage = ImageStorage;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Polyfill
     */
    class Polyfill {
        /**
         * Get request animation frame function
         * @returns {Function}
         */
        static getRequestAnimationFrameFunction() {
            let variables = [
                'requestAnimationFrame',
                'webkitRequestAnimationFrame',
                'mozRequestAnimationFrame',
                'oRequestAnimationFrame',
                'msRequestAnimationFrame'
            ];
            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return window[variableName];
                }
            }
            return function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }
        /**
         * Get cancel animation function
         * @returns {Function}
         */
        static getCancelAnimationFunction() {
            return window.cancelAnimationFrame || window.clearTimeout;
        }
        /**
         * Get device pixel radio
         * @returns {number}
         */
        static getDevicePixelRatio() {
            let variables = [
                'devicePixelRatio',
                'webkitDevicePixelRatio',
                'mozDevicePixelRatio'
            ];
            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return window[variableName];
                }
            }
            return 1;
        }
    }
    SchemeDesigner.Polyfill = Polyfill;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Tools
     */
    class Tools {
        /**
         * Object configurator
         * @param obj
         * @param params
         */
        static configure(obj, params) {
            if (params) {
                for (let paramName in params) {
                    let value = params[paramName];
                    let setter = 'set' + Tools.capitalizeFirstLetter(paramName);
                    if (typeof obj[setter] === 'function') {
                        obj[setter].call(obj, value);
                    }
                }
            }
        }
        /**
         * First latter to uppercase
         * @param string
         * @returns {string}
         */
        static capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        /**
         * Clone object
         * @param obj
         */
        static clone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }
        ;
        /**
         * Check than point in rect
         * @param coordinates
         * @param boundingRect
         * @param rotation - rotation of rect
         * @returns {boolean}
         */
        static pointInRect(coordinates, boundingRect, rotation) {
            let result = false;
            let x = coordinates.x;
            let y = coordinates.y;
            // move point by rotation
            if (rotation) {
                rotation = -rotation;
                let rectCenterX = (boundingRect.left + boundingRect.right) / 2;
                let rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;
                let rotatedPoint = Tools.rotatePointByAxis(coordinates, { x: rectCenterX, y: rectCenterY }, rotation);
                x = rotatedPoint.x;
                y = rotatedPoint.y;
            }
            if (boundingRect.left <= x && boundingRect.right >= x
                && boundingRect.top <= y && boundingRect.bottom >= y) {
                result = true;
            }
            return result;
        }
        /**
         * Rotate point by axis
         * @param point
         * @param axis
         * @param rotation
         * @returns {Coordinates}
         */
        static rotatePointByAxis(point, axis, rotation) {
            rotation = rotation * Math.PI / 180;
            let x = axis.x + (point.x - axis.x) * Math.cos(rotation) - (point.y - axis.y) * Math.sin(rotation);
            let y = axis.y + (point.x - axis.x) * Math.sin(rotation) + (point.y - axis.y) * Math.cos(rotation);
            return { x: x, y: y };
        }
        /**
         * Rect intersect rect
         * @param boundingRect1
         * @param boundingRect2
         * @returns {boolean}
         */
        static rectIntersectRect(boundingRect1, boundingRect2) {
            return !(boundingRect1.top > boundingRect2.bottom
                || boundingRect1.bottom < boundingRect2.top
                || boundingRect1.right < boundingRect2.left
                || boundingRect1.left > boundingRect2.right);
        }
        /**
         * Find objects by coordinates
         * @param boundingRect
         * @param objects
         * @returns {SchemeObject[]}
         */
        static filterObjectsByBoundingRect(boundingRect, objects) {
            let result = [];
            for (let schemeObject of objects) {
                let objectBoundingRect = schemeObject.getOuterBoundingRect();
                let isPart = this.rectIntersectRect(objectBoundingRect, boundingRect);
                if (isPart) {
                    result.push(schemeObject);
                }
            }
            return result;
        }
        /**
         * Filter by bounding rect objects in layers
         * @param boundingRect
         * @param objectsByLayers
         * @returns {SchemeObjectsByLayers}
         */
        static filterLayersObjectsByBoundingRect(boundingRect, objectsByLayers) {
            let result = {};
            for (let layerId in objectsByLayers) {
                let objects = objectsByLayers[layerId];
                result[layerId] = Tools.filterObjectsByBoundingRect(boundingRect, objects);
            }
            return result;
        }
        /**
         * convert max-width/max-height values that may be percentages into a number
         * @param styleValue
         * @param node
         * @param parentProperty
         * @returns {number}
         */
        static parseMaxStyle(styleValue, node, parentProperty) {
            let valueInPixels;
            if (typeof styleValue === 'string') {
                valueInPixels = parseInt(styleValue, 10);
                if (styleValue.indexOf('%') !== -1) {
                    // percentage * size in dimension
                    valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
                }
            }
            else {
                valueInPixels = styleValue;
            }
            return valueInPixels;
        }
        /**
         * Returns if the given value contains an effective constraint.
         * @param value
         * @returns {boolean}
         */
        static isConstrainedValue(value) {
            return value !== undefined && value !== null && value !== 'none';
        }
        /**
         * Get constraint dimention
         * @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
         * @param domNode
         * @param maxStyle
         * @param percentageProperty
         * @returns {null|number}
         */
        static getConstraintDimension(domNode, maxStyle, percentageProperty) {
            let view = document.defaultView;
            let parentNode = domNode.parentNode;
            let constrainedNode = view.getComputedStyle(domNode)[maxStyle];
            let constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
            let hasCNode = this.isConstrainedValue(constrainedNode);
            let hasCContainer = this.isConstrainedValue(constrainedContainer);
            let infinity = Number.POSITIVE_INFINITY;
            if (hasCNode || hasCContainer) {
                return Math.min(hasCNode ? this.parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity, hasCContainer ? this.parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
            }
            return null;
        }
        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        static getConstraintWidth(domNode) {
            return this.getConstraintDimension(domNode, 'max-width', 'clientWidth');
        }
        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        static getConstraintHeight(domNode) {
            return this.getConstraintDimension(domNode, 'max-height', 'clientHeight');
        }
        /**
         * Get max width
         * @param domNode
         * @returns {number}
         */
        static getMaximumWidth(domNode) {
            let container = domNode.parentNode;
            if (!container) {
                return domNode.clientWidth;
            }
            let paddingLeft = parseInt(this.getStyle(container, 'padding-left'), 10);
            let paddingRight = parseInt(this.getStyle(container, 'padding-right'), 10);
            let w = container.clientWidth - paddingLeft - paddingRight;
            let cw = this.getConstraintWidth(domNode);
            return !cw ? w : Math.min(w, cw);
        }
        /**
         * Get max height
         * @param domNode
         * @returns {number}
         */
        static getMaximumHeight(domNode) {
            let container = domNode.parentNode;
            if (!container) {
                return domNode.clientHeight;
            }
            let paddingTop = parseInt(this.getStyle(container, 'padding-top'), 10);
            let paddingBottom = parseInt(this.getStyle(container, 'padding-bottom'), 10);
            let h = container.clientHeight - paddingTop - paddingBottom;
            let ch = this.getConstraintHeight(domNode);
            return !ch ? h : Math.min(h, ch);
        }
        /**
         * Get style
         * @param element
         * @param {string} property
         * @returns {string}
         */
        static getStyle(element, property) {
            return element.currentStyle ?
                element.currentStyle[property] :
                document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        }
        ;
        /**
         * Generate unique id
         * @returns {number}
         */
        static generateUniqueId() {
            this.idNumber++;
            return this.idNumber;
        }
        /**
         * Touch supported
         * @returns {boolean}
         */
        static touchSupported() {
            return 'ontouchstart' in window;
        }
        /**
         * Sorting object
         * @param obj
         * @returns {{}}
         */
        static sortObject(obj) {
            let keys = Object.keys(obj), len = keys.length;
            keys.sort();
            let result = {};
            for (let i = 0; i < len; i++) {
                let k = keys[i];
                result[k] = obj[k];
            }
            return result;
        }
        /**
         * Get random string
         * @returns {string}
         */
        static getRandomString() {
            return Math.random().toString(36).substr(2, 9);
        }
        /**
         * Disable selection on element
         * @param element
         */
        static disableElementSelection(element) {
            let styles = [
                '-webkit-touch-callout',
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-ms-user-select',
                'user-select',
                'outline'
            ];
            for (let styleName of styles) {
                element.style[styleName] = 'none';
            }
        }
        /**
         * Get pointer from event
         * @param e
         * @param clientProp
         * @returns {number}
         */
        static getPointer(e, clientProp) {
            let touchProp = e.type === 'touchend' ? 'changedTouches' : 'touches';
            let event = e;
            // touch event
            if (event[touchProp] && event[touchProp][0]) {
                if (event[touchProp].length == 2) {
                    return (event[touchProp][0][clientProp] + event[touchProp][1][clientProp]) / 2;
                }
                return event[touchProp][0][clientProp];
            }
            return event[clientProp];
        }
    }
    /**
     * Number for id generator
     * @type {number}
     */
    Tools.idNumber = 0;
    SchemeDesigner.Tools = Tools;
})(SchemeDesigner || (SchemeDesigner = {}));


var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * View
     */
    class View {
        /**
         * Constructor
         * @param canvas
         * @param background
         */
        constructor(canvas, background = null) {
            /**
             * scroll left
             */
            this.scrollLeft = 0;
            /**
             * Scroll top
             */
            this.scrollTop = 0;
            /**
             * Scale
             */
            this.scale = 0;
            /**
             * Width
             */
            this.width = 0;
            /**
             * Height
             */
            this.height = 0;
            /**
             * Background
             */
            this.background = null;
            this.canvas = canvas;
            this.background = background;
            if (this.background) {
                this.context = this.canvas.getContext('2d', { alpha: false });
            }
            else {
                this.context = this.canvas.getContext('2d');
            }
        }
        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        getCanvas() {
            return this.canvas;
        }
        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        getContext() {
            return this.context;
        }
        /**
         * Set scroll left
         * @param value
         */
        setScrollLeft(value) {
            this.scrollLeft = value;
        }
        /**
         * Set scroll top
         * @param value
         */
        setScrollTop(value) {
            this.scrollTop = value;
        }
        /**
         * Set scale
         * @param value
         */
        setScale(value) {
            this.scale = value;
        }
        /**
         * Get scroll left
         * @returns {number}
         */
        getScrollLeft() {
            return this.scrollLeft;
        }
        /**
         * Get scroll top
         * @returns {number}
         */
        getScrollTop() {
            return this.scrollTop;
        }
        /**
         * Get scale
         * @returns {number}
         */
        getScale() {
            return this.scale;
        }
        /**
         * Set dimensions
         * @param dimensions
         */
        setDimensions(dimensions) {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
            this.width = dimensions.width;
            this.height = dimensions.height;
        }
        /**
         * Get width
         * @returns {number}
         */
        getWidth() {
            return this.width;
        }
        /**
         * Get height
         * @returns {number}
         */
        getHeight() {
            return this.height;
        }
        /**
         * Apply transformation
         */
        applyTransformation() {
            this.context.setTransform(this.scale, 0, 0, this.scale, this.scrollLeft, this.scrollTop);
        }
        /**
         * Resize view
         */
        resize() {
            let newWidth = Math.max(0, Math.floor(SchemeDesigner.Tools.getMaximumWidth(this.getCanvas())));
            let newHeight = Math.max(0, Math.floor(SchemeDesigner.Tools.getMaximumHeight(this.getCanvas())));
            this.setDimensions({
                width: newWidth,
                height: newHeight
            });
        }
        /**
         * Draw background
         * @returns {boolean}
         */
        drawBackground() {
            if (!this.background) {
                return false;
            }
            let context = this.getContext();
            context.fillStyle = this.background;
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.fillRect(0, 0, this.width, this.height);
            context.restore();
            return true;
        }
    }
    SchemeDesigner.View = View;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Event manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class EventManager {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme) {
            /**
             * Is dragging
             */
            this.isDragging = false;
            /**
             * Left button down
             */
            this.leftButtonDown = false;
            /**
             * Hovered objects
             */
            this.hoveredObjects = [];
            /**
             * Last touch end time
             * @type {number}
             */
            this.lastTouchEndTime = 0;
            /**
             * Delay for prevent double tap
             */
            this.doubleTapDelay = 300;
            this.scheme = scheme;
            this.setLastClientPosition({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            });
            this.bindEvents();
        }
        /**
         * Bind events
         */
        bindEvents() {
            // mouse events
            this.scheme.getCanvas().addEventListener('mousedown', (e) => {
                this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('mouseup', (e) => {
                this.onMouseUp(e);
            });
            this.scheme.getCanvas().addEventListener('click', (e) => {
                this.onClick(e);
            });
            this.scheme.getCanvas().addEventListener('dblclick', (e) => {
                this.onDoubleClick(e);
            });
            this.scheme.getCanvas().addEventListener('mousemove', (e) => {
                this.onMouseMove(e);
            });
            this.scheme.getCanvas().addEventListener('mouseout', (e) => {
                this.onMouseOut(e);
            });
            this.scheme.getCanvas().addEventListener('mouseenter', (e) => {
                this.onMouseEnter(e);
            });
            this.scheme.getCanvas().addEventListener('contextmenu', (e) => {
                this.onContextMenu(e);
            });
            // wheel
            this.scheme.getCanvas().addEventListener('mousewheel', (e) => {
                this.onMouseWheel(e);
            });
            // for FF
            this.scheme.getCanvas().addEventListener('DOMMouseScroll', (e) => {
                this.onMouseWheel(e);
            });
            // touch events
            this.scheme.getCanvas().addEventListener('touchstart', (e) => {
                this.touchDistance = 0;
                this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('touchmove', (e) => {
                if (!e.targetTouches) {
                    return false;
                }
                if (e.targetTouches.length == 1) {
                    // one finger - dragging
                    this.onMouseMove(e);
                }
                else if (e.targetTouches.length == 2) {
                    // two finger - zoom
                    const p1 = e.targetTouches[0];
                    const p2 = e.targetTouches[1];
                    // euclidean distance
                    let distance = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2));
                    let delta = 0;
                    if (this.touchDistance) {
                        delta = distance - this.touchDistance;
                    }
                    this.touchDistance = distance;
                    if (delta) {
                        this.scheme.getZoomManager().zoomToPointer(e, delta / 5);
                    }
                }
                e.preventDefault();
            });
            this.scheme.getCanvas().addEventListener('touchend', (e) => {
                // prevent double tap zoom
                let now = (new Date()).getTime();
                if (this.lastTouchEndTime && now - this.lastTouchEndTime <= this.doubleTapDelay) {
                    e.preventDefault();
                }
                else {
                    this.onMouseUp(e);
                }
                this.lastTouchEndTime = now;
            });
            this.scheme.getCanvas().addEventListener('touchcancel', (e) => {
                this.onMouseUp(e);
            });
            // resize
            window.addEventListener('resize', (e) => {
                let prevScale = this.scheme.getZoomManager().getScale();
                this.scheme.resize();
                this.scheme.requestRenderAll();
                if (!this.scheme.getZoomManager().zoomByFactor(prevScale)) {
                    this.scheme.getZoomManager().setScale(this.scheme.getZoomManager().getScaleWithAllObjects());
                }
            });
        }
        /**
         * Mouse down
         * @param e
         */
        onMouseDown(e) {
            this.leftButtonDown = true;
            this.setLastClientPositionFromEvent(e);
        }
        /**
         * Mouse up
         * @param e
         */
        onMouseUp(e) {
            this.leftButtonDown = false;
            this.setLastClientPositionFromEvent(e);
            if (this.isDragging) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
                this.scheme.requestRenderAll();
            }
            // defer for prevent trigger click on mouseUp
            setTimeout(() => { this.isDragging = false; }, 1);
        }
        /**
         * On click
         * @param e
         */
        onClick(e) {
            if (!this.isDragging) {
                let objects = this.findObjectsForEvent(e);
                for (let schemeObject of objects) {
                    schemeObject.click(e, this.scheme, this.scheme.getView());
                    this.scheme.addChangedObject(schemeObject);
                    this.sendEvent('clickOnObject', schemeObject);
                }
                if (objects.length) {
                    this.scheme.requestRenderAll();
                    this.scheme.updateCache(true);
                }
            }
        }
        /**
         * Double click
         * @param e
         */
        onDoubleClick(e) {
            let zoomManager = this.scheme.getZoomManager();
            zoomManager.zoomToPointer(e, zoomManager.getClickZoomDelta());
        }
        /**
         * Right click
         * @param e
         */
        onContextMenu(e) {
        }
        /**
         * On mouse move
         * @param e
         */
        onMouseMove(e) {
            if (this.leftButtonDown) {
                let newCoordinates = this.getCoordinatesFromEvent(e);
                let deltaX = Math.abs(newCoordinates.x - this.getLastClientX());
                let deltaY = Math.abs(newCoordinates.y - this.getLastClientY());
                // 1 - is click with offset - mis drag
                if (deltaX > 1 || deltaY > 1) {
                    this.isDragging = true;
                    this.scheme.setCursorStyle('move');
                }
            }
            if (!this.isDragging) {
                this.handleHover(e);
            }
            else {
                this.scheme.getScrollManager().handleDragging(e);
            }
        }
        /**
         * Handling hover
         * @param e
         */
        handleHover(e) {
            this.setLastClientPositionFromEvent(e);
            let objects = this.findObjectsForEvent(e);
            let mustReRender = false;
            let hasNewHovers = false;
            if (this.hoveredObjects.length) {
                for (let schemeHoveredObject of this.hoveredObjects) {
                    let alreadyHovered = false;
                    for (let schemeObject of objects) {
                        if (schemeObject == schemeHoveredObject) {
                            alreadyHovered = true;
                        }
                    }
                    if (!alreadyHovered) {
                        schemeHoveredObject.isHovered = false;
                        let result = schemeHoveredObject.mouseLeave(e, this.scheme, this.scheme.getView());
                        this.scheme.addChangedObject(schemeHoveredObject);
                        this.sendEvent('mouseLeaveObject', schemeHoveredObject);
                        if (result !== false) {
                            mustReRender = true;
                        }
                        hasNewHovers = true;
                    }
                }
            }
            if (!this.hoveredObjects.length || hasNewHovers) {
                for (let schemeObject of objects) {
                    schemeObject.isHovered = true;
                    this.scheme.setCursorStyle(schemeObject.cursorStyle);
                    let result = schemeObject.mouseOver(e, this.scheme, this.scheme.getView());
                    if (result !== false) {
                        mustReRender = true;
                    }
                    this.scheme.addChangedObject(schemeObject);
                    this.sendEvent('mouseOverObject', schemeObject, e);
                }
            }
            this.hoveredObjects = objects;
            if (!objects.length) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
            }
            if (mustReRender) {
                this.scheme.requestRenderAll();
                if (this.scheme.getCacheOnHover()) {
                    this.scheme.updateCache(true);
                }
            }
        }
        /**
         * Mouse out
         * @param e
         */
        onMouseOut(e) {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
            this.scheme.requestRenderAll();
        }
        /**
         * Mouse enter
         * @param e
         */
        onMouseEnter(e) {
        }
        /**
         * Zoom by wheel
         * @param e
         */
        onMouseWheel(e) {
            return this.scheme.getZoomManager().handleMouseWheel(e);
        }
        /**
         * Set last client position
         * @param e
         */
        setLastClientPositionFromEvent(e) {
            let coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
        }
        /**
         * Find objects by event
         * @param e
         * @returns {SchemeObject[]}
         */
        findObjectsForEvent(e) {
            let coordinates = this.getCoordinatesFromEvent(e);
            return this.scheme.getStorageManager().findObjectsByCoordinates(coordinates);
        }
        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        getCoordinatesFromEvent(e) {
            let clientRect = this.scheme.getCanvas().getBoundingClientRect();
            let x = SchemeDesigner.Tools.getPointer(e, 'clientX') - clientRect.left;
            let y = SchemeDesigner.Tools.getPointer(e, 'clientY') - clientRect.top;
            return { x, y };
        }
        /**
         * Set last client position
         * @param coordinates
         */
        setLastClientPosition(coordinates) {
            this.lastClientPosition = coordinates;
        }
        /**
         * Get last client x
         * @returns {number}
         */
        getLastClientX() {
            return this.lastClientPosition.x;
        }
        /**
         * Get last client y
         * @returns {number}
         */
        getLastClientY() {
            return this.lastClientPosition.y;
        }
        /**
         * Send event
         * @param {string} eventName
         * @param data
         * @param {UIEvent} originalEvent
         */
        sendEvent(eventName, data, originalEvent) {
            let fullEventName = `schemeDesigner.${eventName}`;
            if (typeof CustomEvent === 'function') {
                let dataForSend = data;
                if (typeof originalEvent !== 'undefined') {
                    dataForSend = {
                        data: data,
                        originalEvent: originalEvent,
                    };
                }
                let event = new CustomEvent(fullEventName, {
                    detail: dataForSend
                });
                this.scheme.getCanvas().dispatchEvent(event);
            }
            else {
                let event = document.createEvent('CustomEvent');
                event.initCustomEvent(fullEventName, false, false, data);
                this.scheme.getCanvas().dispatchEvent(event);
            }
        }
        /**
         * Set doubleTapDelay
         * @param value
         */
        setDoubleTapDelay(value) {
            this.doubleTapDelay = value;
        }
    }
    SchemeDesigner.EventManager = EventManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Map manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class MapManager {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme) {
            /**
             * Is dragging
             */
            this.isDragging = false;
            /**
             * Left button down
             */
            this.leftButtonDown = false;
            /**
             * Last touch end time
             * @type {number}
             */
            this.lastTouchEndTime = 0;
            this.scheme = scheme;
        }
        /**
         * Scaled scheme rect
         * @returns {number}
         */
        getScaledSchemeRect() {
            let imageBoundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let imageWidth = imageBoundingRect.right;
            let imageHeight = imageBoundingRect.bottom;
            let mapWidth = this.mapView.getWidth();
            let mapHeight = this.mapView.getHeight();
            let mapRatio = mapWidth / mapHeight;
            let imageRatio = imageWidth / imageHeight;
            let scaleFactor = mapRatio < imageRatio ? mapWidth / imageWidth : mapHeight / imageHeight;
            let newImageWidth = imageWidth * scaleFactor;
            let newImageHeight = imageHeight * scaleFactor;
            let leftOffset = (mapWidth - newImageWidth) / 2;
            let topOffset = (mapHeight - newImageHeight) / 2;
            return {
                scaleFactor: scaleFactor,
                width: newImageWidth,
                height: newImageHeight,
                leftOffset: leftOffset,
                topOffset: topOffset
            };
        }
        /**
         * Get rect dimensions
         * @param scaledSchemeRect
         * @returns BoundingRect
         */
        getRectBoundingRect(scaledSchemeRect) {
            let visibleBoundingRect = this.scheme.getVisibleBoundingRect();
            let rectX = visibleBoundingRect.left * scaledSchemeRect.scaleFactor + scaledSchemeRect.leftOffset;
            let rectY = visibleBoundingRect.top * scaledSchemeRect.scaleFactor + scaledSchemeRect.topOffset;
            let rectWidth = (visibleBoundingRect.right - visibleBoundingRect.left) * scaledSchemeRect.scaleFactor;
            let rectHeight = (visibleBoundingRect.bottom - visibleBoundingRect.top) * scaledSchemeRect.scaleFactor;
            return {
                left: rectX,
                top: rectY,
                right: rectX + rectWidth,
                bottom: rectY + rectHeight
            };
        }
        /**
         * Draw map
         * @returns {boolean}
         */
        drawMap() {
            let cacheView = this.scheme.getCacheView();
            if (!this.mapView || !cacheView) {
                return false;
            }
            let scaledSchemeRect = this.getScaledSchemeRect();
            let mapContext = this.mapView.getContext();
            mapContext.clearRect(0, 0, this.mapView.getWidth(), this.mapView.getHeight());
            mapContext.drawImage(cacheView.getCanvas(), scaledSchemeRect.leftOffset, scaledSchemeRect.topOffset, scaledSchemeRect.width, scaledSchemeRect.height);
            let rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            this.drawRect(rectBoundingRect);
            return true;
        }
        /**
         * Draw rect
         * @param boundingRect
         */
        drawRect(boundingRect) {
            let mapContext = this.mapView.getContext();
            mapContext.lineWidth = 1;
            mapContext.strokeStyle = '#000';
            mapContext.strokeRect(boundingRect.left, boundingRect.top, boundingRect.right - boundingRect.left, boundingRect.bottom - boundingRect.top);
            let rectBackgroundWidth = this.mapView.getWidth() * 2;
            let rectBackgroundHeight = this.mapView.getHeight() * 2;
            let backgroundColor = 'rgba(0, 0, 0, 0.1)';
            mapContext.fillStyle = backgroundColor;
            mapContext.strokeStyle = backgroundColor;
            mapContext.lineWidth = 0;
            mapContext.fillRect(0, 0, boundingRect.left, rectBackgroundHeight);
            mapContext.fillRect(boundingRect.left, 0, boundingRect.right - boundingRect.left, boundingRect.top);
            mapContext.fillRect(boundingRect.right, 0, rectBackgroundWidth, rectBackgroundHeight);
            mapContext.fillRect(boundingRect.left, boundingRect.bottom, boundingRect.right - boundingRect.left, rectBackgroundHeight);
        }
        /**
         * Set mapCanvas
         * @param value
         */
        setMapCanvas(value) {
            this.mapCanvas = value;
            this.mapView = new SchemeDesigner.View(this.mapCanvas);
            this.bindEvents();
            SchemeDesigner.Tools.disableElementSelection(this.mapCanvas);
        }
        /**
         * Resize map view
         */
        resize() {
            if (this.mapView) {
                this.mapView.resize();
            }
        }
        /**
         * Bind events
         */
        bindEvents() {
            // mouse events
            this.mapCanvas.addEventListener('mousedown', (e) => {
                this.onMouseDown(e);
            });
            this.mapCanvas.addEventListener('mouseup', (e) => {
                this.onMouseUp(e);
            });
            this.mapCanvas.addEventListener('mousemove', (e) => {
                this.onMouseMove(e);
            });
            this.mapCanvas.addEventListener('mouseout', (e) => {
                this.onMouseOut(e);
            });
            this.mapCanvas.addEventListener('click', (e) => {
                this.onClick(e);
            });
            // wheel
            this.mapCanvas.addEventListener('mousewheel', (e) => {
                this.onMouseWheel(e);
            });
            // for FF
            this.mapCanvas.addEventListener('DOMMouseScroll', (e) => {
                this.onMouseWheel(e);
            });
        }
        /**
         * Zoom by wheel
         * @param e
         */
        onMouseWheel(e) {
            let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.scheme.getZoomManager().zoomToCenter(delta);
            }
            return e.preventDefault() && false;
        }
        /**
         * Mouse down
         * @param e
         */
        onMouseDown(e) {
            this.leftButtonDown = true;
            this.setLastClientPositionFromEvent(e);
        }
        /**
         * Mouse out
         * @param e
         */
        onMouseOut(e) {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
        }
        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        setCursorStyle(cursor) {
            this.mapCanvas.style.cursor = cursor;
            return this;
        }
        /**
         * Mouse up
         * @param e
         */
        onMouseUp(e) {
            this.leftButtonDown = false;
            this.setLastClientPositionFromEvent(e);
            if (this.isDragging) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.setCursorStyle('default');
            }
            // defer for prevent trigger click on mouseUp
            setTimeout(() => { this.isDragging = false; }, 1);
        }
        /**
         * On mouse move
         * @param e
         */
        onMouseMove(e) {
            if (this.leftButtonDown) {
                let newCoordinates = this.getCoordinatesFromEvent(e);
                let deltaX = Math.abs(newCoordinates.x - this.getLastClientX());
                let deltaY = Math.abs(newCoordinates.y - this.getLastClientY());
                // 1 - is click with offset - mis drag
                if (deltaX > 1 || deltaY > 1) {
                    this.isDragging = true;
                    this.setCursorStyle('move');
                }
            }
            if (this.isDragging) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        }
        /**
         * Set last client position
         * @param e
         */
        setLastClientPositionFromEvent(e) {
            let coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
        }
        /**
         * Set last client position
         * @param coordinates
         */
        setLastClientPosition(coordinates) {
            this.lastClientPosition = coordinates;
        }
        /**
         * Get last client x
         * @returns {number}
         */
        getLastClientX() {
            return this.lastClientPosition.x;
        }
        /**
         * Get last client y
         * @returns {number}
         */
        getLastClientY() {
            return this.lastClientPosition.y;
        }
        /**
         * Get real scheme coordinates
         * @param coordinates
         * @returns {{x: number, y: number}}
         */
        getRealCoordinates(coordinates) {
            let scaledSchemeRect = this.getScaledSchemeRect();
            let schemeScale = this.scheme.getZoomManager().getScale();
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            let rectWidth = rectBoundingRect.right - rectBoundingRect.left;
            let rectHeight = rectBoundingRect.bottom - rectBoundingRect.top;
            let realX = (coordinates.x - scaledSchemeRect.leftOffset - (rectWidth / 2)) / scaledSchemeRect.scaleFactor;
            let realY = (coordinates.y - scaledSchemeRect.topOffset - (rectHeight / 2)) / scaledSchemeRect.scaleFactor;
            // process scheme scale
            let x = (realX - boundingRect.left) * schemeScale;
            let y = (realY - boundingRect.top) * schemeScale;
            return {
                x: x,
                y: y
            };
        }
        /**
         * Scroll by coordinates
         * @param coordinates
         */
        scrollByCoordinates(coordinates) {
            let realCoordinates = this.getRealCoordinates(coordinates);
            this.scheme.getScrollManager().scroll(-realCoordinates.x, -realCoordinates.y);
        }
        /**
         * On click
         * @param e
         */
        onClick(e) {
            if (!this.isDragging) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        }
        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        getCoordinatesFromEvent(e) {
            let clientRect = this.mapCanvas.getBoundingClientRect();
            let x = SchemeDesigner.Tools.getPointer(e, 'clientX') - clientRect.left;
            let y = SchemeDesigner.Tools.getPointer(e, 'clientY') - clientRect.top;
            return { x, y };
        }
    }
    SchemeDesigner.MapManager = MapManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Scroll manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class ScrollManager {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme) {
            /**
             * Scroll left
             */
            this.scrollLeft = 0;
            /**
             * Scroll top
             */
            this.scrollTop = 0;
            /**
             * Max hidden part on scroll
             */
            this.maxHiddenPart = 0.5;
            /**
             * Scheme draggable enabled
             */
            this.draggable = true;
            this.draggableLeft = true;
            this.draggableTop = true;
            this.scheme = scheme;
        }
        /**
         * Get scroll left
         * @returns {number}
         */
        getScrollLeft() {
            return this.scrollLeft;
        }
        /**
         * Get scroll top
         * @returns {number}
         */
        getScrollTop() {
            return this.scrollTop;
        }
        /**
         * Set scroll
         * @param {number} left
         * @param {number} top
         */
        scroll(left, top) {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let scale = this.scheme.getZoomManager().getScale();
            let maxScrollLeft = -(boundingRect.left) * scale;
            let maxScrollTop = -(boundingRect.top) * scale;
            let minScrollLeft = -(boundingRect.right) * scale;
            let minScrollTop = -(boundingRect.bottom) * scale;
            maxScrollLeft = maxScrollLeft + (this.scheme.getWidth() * this.maxHiddenPart);
            maxScrollTop = maxScrollTop + (this.scheme.getHeight() * this.maxHiddenPart);
            minScrollLeft = minScrollLeft + (this.scheme.getWidth() * (1 - this.maxHiddenPart));
            minScrollTop = minScrollTop + (this.scheme.getHeight() * (1 - this.maxHiddenPart));
            if (left > maxScrollLeft) {
                left = maxScrollLeft;
            }
            if (top > maxScrollTop) {
                top = maxScrollTop;
            }
            if (left < minScrollLeft) {
                left = minScrollLeft;
            }
            if (top < minScrollTop) {
                top = minScrollTop;
            }
            this.scrollLeft = left;
            this.scrollTop = top;
            this.scheme.getView().setScrollTop(top);
            this.scheme.getView().setScrollLeft(left);
            this.scheme.getView().applyTransformation();
            // scroll fake scheme
            if (this.scheme.useSchemeCache()) {
                this.scheme.requestDrawFromCache();
            }
            else {
                this.scheme.requestRenderAll();
            }
            this.scheme.getEventManager().sendEvent('scroll', {
                left: left,
                top: top,
                maxScrollLeft: maxScrollLeft,
                maxScrollTop: maxScrollTop,
                minScrollLeft: minScrollLeft,
                minScrollTop: minScrollTop,
                boundingRect: boundingRect,
                scale: scale
            });
        }
        /**
         * Set scheme to center og objects
         */
        toCenter() {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let objectsDimensions = this.scheme.getStorageManager().getObjectsDimensions();
            let scale = this.scheme.getZoomManager().getScale();
            let widthDelta = this.scheme.getWidth() / scale - objectsDimensions.width;
            let heightDelta = this.scheme.getHeight() / scale - objectsDimensions.height;
            let scrollLeft = ((widthDelta / 2) - boundingRect.left) * scale;
            let scrollTop = ((heightDelta / 2) - boundingRect.top) * scale;
            this.scroll(scrollLeft, scrollTop);
        }
        /**
         * Handle dragging
         * @param e
         */
        handleDragging(e) {
            if (!this.draggable) {
                return;
            }
            let lastClientX = this.scheme.getEventManager().getLastClientX();
            let lastClientY = this.scheme.getEventManager().getLastClientY();
            this.scheme.getEventManager().setLastClientPositionFromEvent(e);
            let leftCenterOffset = this.scheme.getEventManager().getLastClientX() - lastClientX;
            let topCenterOffset = this.scheme.getEventManager().getLastClientY() - lastClientY;
            let scrollLeft = this.draggableLeft ? leftCenterOffset + this.getScrollLeft() : leftCenterOffset;
            let scrollTop = this.draggableTop ? topCenterOffset + this.getScrollTop() : topCenterOffset;
            this.scroll(scrollLeft, scrollTop);
        }
        /**
         * Set max hidden part
         * @param value
         */
        setMaxHiddenPart(value) {
            this.maxHiddenPart = value;
        }
        /**
         * Set draggable
         * @param value
         */
        setDraggable(value) {
            this.draggable = value;
        }
        /**
         * Get draggable
         */
        getDraggable() {
            return this.draggable;
        }
        /**
        * Set draggableLeft
        * @param value
        */
        setDraggableLeft(value) {
            this.draggableLeft = value;
        }
        /**
         * Get draggableLeft
         */
        getDraggableLeft() {
            return this.draggableLeft;
        }
        /**
         * Set draggableTop
         * @param value
         */
        setDraggableTop(value) {
            this.draggableTop = value;
        }
        /**
         * Get draggableTop
         */
        getDraggableTop() {
            return this.draggableTop;
        }
    }
    SchemeDesigner.ScrollManager = ScrollManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Storage manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class StorageManager {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme) {
            /**
             * Depth of tree
             */
            this.treeDepth = 6;
            /**
             * Layers
             */
            this.layers = {};
            this.scheme = scheme;
        }
        /**
         * Get layer by id
         * @param {string} id
         * @return {SchemeDesigner.Layer | null}
         */
        getLayerById(id) {
            if (typeof this.layers[id] != 'undefined') {
                return this.layers[id];
            }
            return null;
        }
        /**
         * Get objects from visible layers
         * @return {SchemeDesigner.SchemeObject[]}
         */
        getVisibleObjects() {
            let result = [];
            let visibleObjectsByLayers = this.getVisibleObjectsByLayers();
            for (let layerId in visibleObjectsByLayers) {
                let objects = visibleObjectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = [...result, ...objects];
                }
            }
            return result;
        }
        /**
         * Get visible objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        getVisibleObjectsByLayers() {
            let result = {};
            let layers = this.getSortedLayers();
            for (let layer of layers) {
                if (layer.isVisible()) {
                    let objects = layer.getObjects();
                    if (typeof objects !== 'undefined' && objects.length) {
                        result[layer.getId()] = objects;
                    }
                }
            }
            return result;
        }
        /**
         * Set layers
         * @param {SchemeDesigner.Layer[]} layers
         */
        setLayers(layers) {
            for (let layer of layers) {
                this.addLayer(layer);
            }
        }
        /**
         * Get layers
         * @returns {Layers}
         */
        getLayers() {
            return this.layers;
        }
        /**
         * Get sorted layers by z-index
         * @returns {Layer[]}
         */
        getSortedLayers() {
            let layers = [];
            for (let layerId in this.layers) {
                let layer = this.layers[layerId];
                if (layer.isVisible()) {
                    layers.push(layer);
                }
            }
            // sort layers by z-index
            layers.sort(function (a, b) {
                if (a.getZIndex() < b.getZIndex()) {
                    return -1;
                }
                if (a.getZIndex() > b.getZIndex()) {
                    return 1;
                }
                return 0;
            });
            return layers;
        }
        /**
         * Add layer
         * @param {SchemeDesigner.Layer} layer
         */
        addLayer(layer) {
            let existLayer = this.getLayerById(layer.getId());
            if (existLayer instanceof SchemeDesigner.Layer) {
                throw new Error('Layer with such id already exist');
            }
            this.layers[layer.getId()] = layer;
        }
        /**
         * Remove all layers
         */
        removeLayers() {
            this.layers = {};
            this.applyStructureChange();
        }
        /**
         * Remove layer
         */
        removeLayer(layerId) {
            delete this.layers[layerId];
            this.applyStructureChange();
        }
        /**
         * Set layer visibility
         * @param {string} layerId
         * @param {boolean} visible
         */
        setLayerVisibility(layerId, visible) {
            let layer = this.getLayerById(layerId);
            if (!(layer instanceof SchemeDesigner.Layer)) {
                throw new Error('Layer not found');
            }
            layer.setVisible(visible);
            this.applyStructureChange();
        }
        /**
         * Set layer activity
         * @param layerId
         * @param active
         */
        setLayerActivity(layerId, active) {
            let layer = this.getLayerById(layerId);
            if (!(layer instanceof SchemeDesigner.Layer)) {
                throw new Error('Layer not found');
            }
            layer.setActive(active);
        }
        /**
         * Apple structure change
         */
        applyStructureChange() {
            this.requestBuildTree();
            this.reCalcObjectsBoundingRect();
            this.scheme.updateCache(false);
            this.scheme.requestRenderAll();
        }
        /**
         * find objects by coordinates in tree
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        findObjectsByCoordinates(coordinates) {
            let result = [];
            let x = coordinates.x;
            let y = coordinates.y;
            // scroll
            x = x - this.scheme.getScrollManager().getScrollLeft();
            y = y - this.scheme.getScrollManager().getScrollTop();
            // scale
            x = x / this.scheme.getZoomManager().getScale();
            y = y / this.scheme.getZoomManager().getScale();
            // search node
            let rootNode = this.getTree();
            let node = this.findNodeByCoordinates(rootNode, { x: x, y: y });
            let nodeObjectsByLayers = {};
            if (node) {
                nodeObjectsByLayers = node.getObjectsByLayers();
            }
            const normalizeCursorCoordinates = { x: x, y: y };
            // search object in node
            for (let layerId in nodeObjectsByLayers) {
                let layer = this.getLayerById(layerId);
                if (!layer.isActive()) {
                    continue;
                }
                let objects = nodeObjectsByLayers[layerId];
                for (let schemeObject of objects) {
                    if (!schemeObject.isActive()) {
                        continue;
                    }
                    let boundingRect = schemeObject.getBoundingRect();
                    // check point in rect
                    if (!SchemeDesigner.Tools.pointInRect(normalizeCursorCoordinates, boundingRect, schemeObject.getRotation())) {
                        continue;
                    }
                    // check point in object
                    let normalizeCursorCoordinatesByObjectRect = {
                        x: normalizeCursorCoordinates.x - schemeObject.getX(),
                        y: normalizeCursorCoordinates.y - schemeObject.getY()
                    };
                    if (!schemeObject.checkPointInObject(normalizeCursorCoordinatesByObjectRect, this.scheme, this.scheme.getView())) {
                        continue;
                    }
                    result.push(schemeObject);
                }
            }
            return result;
        }
        /**
         * Get bounding rect of all objects
         * @returns BoundingRect
         */
        getObjectsBoundingRect() {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        }
        /**
         * All objects dimensions
         * @returns {Dimensions}
         */
        getObjectsDimensions() {
            let boundingRect = this.getObjectsBoundingRect();
            return {
                width: boundingRect.right - boundingRect.left,
                height: boundingRect.bottom - boundingRect.top
            };
        }
        /**
         * Recalculate bounding rect
         */
        reCalcObjectsBoundingRect() {
            this.objectsBoundingRect = null;
        }
        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        calculateObjectsBoundingRect() {
            let top;
            let left;
            let right;
            let bottom;
            let visibleObjects = this.getVisibleObjects();
            if (visibleObjects.length) {
                for (let schemeObject of visibleObjects) {
                    let schemeObjectBoundingRect = schemeObject.getBoundingRect();
                    if (top == undefined || schemeObjectBoundingRect.top < top) {
                        top = schemeObjectBoundingRect.top;
                    }
                    if (left == undefined || schemeObjectBoundingRect.left < left) {
                        left = schemeObjectBoundingRect.left;
                    }
                    if (right == undefined || schemeObjectBoundingRect.right > right) {
                        right = schemeObjectBoundingRect.right;
                    }
                    if (bottom == undefined || schemeObjectBoundingRect.bottom > bottom) {
                        bottom = schemeObjectBoundingRect.bottom;
                    }
                }
            }
            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom
            };
        }
        /**
         * Set tree depth
         * @param value
         */
        setTreeDepth(value) {
            this.treeDepth = value;
        }
        /**
         * Request build tree
         */
        requestBuildTree() {
            this.rootTreeNode = null;
        }
        /**
         * Get tree
         * @returns {TreeNode}
         */
        getTree() {
            if (!this.rootTreeNode) {
                this.rootTreeNode = this.buildTree();
            }
            return this.rootTreeNode;
        }
        /**
         * Build tree
         * @returns {TreeNode}
         */
        buildTree() {
            let boundingRect = this.getObjectsBoundingRect();
            this.rootTreeNode = new TreeNode(null, boundingRect, this.getVisibleObjectsByLayers(), 0);
            this.explodeTreeNodes(this.rootTreeNode, this.treeDepth);
            return this.rootTreeNode;
        }
        /**
         * Recursive explode node
         * @param node
         * @param depth
         */
        explodeTreeNodes(node, depth) {
            this.explodeTreeNode(node);
            depth--;
            if (depth > 0) {
                for (let childNode of node.getChildren()) {
                    this.explodeTreeNodes(childNode, depth);
                }
            }
        }
        /**
         * Explode node to children
         * @param node
         */
        explodeTreeNode(node) {
            let nodeBoundingRect = node.getBoundingRect();
            let newDepth = node.getDepth() + 1;
            let leftBoundingRect = SchemeDesigner.Tools.clone(nodeBoundingRect);
            let rightBoundingRect = SchemeDesigner.Tools.clone(nodeBoundingRect);
            /**
             * Width or height explode
             */
            if (newDepth % 2 == 1) {
                let width = nodeBoundingRect.right - nodeBoundingRect.left;
                let delta = width / 2;
                leftBoundingRect.right = leftBoundingRect.right - delta;
                rightBoundingRect.left = rightBoundingRect.left + delta;
            }
            else {
                let height = nodeBoundingRect.bottom - nodeBoundingRect.top;
                let delta = height / 2;
                leftBoundingRect.bottom = leftBoundingRect.bottom - delta;
                rightBoundingRect.top = rightBoundingRect.top + delta;
            }
            let leftNodeObjects = SchemeDesigner.Tools.filterLayersObjectsByBoundingRect(leftBoundingRect, node.getObjectsByLayers());
            let rightNodeObjects = SchemeDesigner.Tools.filterLayersObjectsByBoundingRect(rightBoundingRect, node.getObjectsByLayers());
            let leftNode = new TreeNode(node, leftBoundingRect, leftNodeObjects, newDepth);
            let rightNode = new TreeNode(node, rightBoundingRect, rightNodeObjects, newDepth);
            node.addChild(leftNode);
            node.addChild(rightNode);
            node.removeObjects();
        }
        /**
         * Find node by coordinates
         * @param node
         * @param coordinates
         * @returns {TreeNode|null}
         */
        findNodeByCoordinates(node, coordinates) {
            let childNode = node.getChildByCoordinates(coordinates);
            if (!childNode) {
                return null;
            }
            if (childNode.isLastNode()) {
                return childNode;
            }
            else {
                return this.findNodeByCoordinates(childNode, coordinates);
            }
        }
        /**
         * Find nodes by rect
         * @param node
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        findNodesByBoundingRect(node, boundingRect) {
            if (!node) {
                node = this.getTree();
            }
            let result = [];
            let childNodes = node.getChildrenByBoundingRect(boundingRect);
            for (let childNode of childNodes) {
                if (childNode.isLastNode()) {
                    result.push(childNode);
                }
                else {
                    let subChildNodes = this.findNodesByBoundingRect(childNode, boundingRect);
                    for (let subChildNode of subChildNodes) {
                        result.push(subChildNode);
                    }
                }
            }
            return result;
        }
        /**
         * Draw bounds of nodes for testing
         */
        showNodesParts() {
            let lastTreeNodes = this.getTree().getLastChildren();
            let context = this.scheme.getView().getContext();
            for (let lastTreeNode of lastTreeNodes) {
                let relativeX = lastTreeNode.getBoundingRect().left + this.scheme.getScrollManager().getScrollLeft();
                let relativeY = lastTreeNode.getBoundingRect().top + this.scheme.getScrollManager().getScrollTop();
                let width = lastTreeNode.getBoundingRect().right - lastTreeNode.getBoundingRect().left;
                let height = lastTreeNode.getBoundingRect().bottom - lastTreeNode.getBoundingRect().top;
                context.lineWidth = 1;
                context.strokeStyle = 'black';
                context.rect(relativeX, relativeY, width, height);
                context.stroke();
            }
        }
        /**
         * Return image storage
         * @param id
         * @returns {ImageStorage}
         */
        getImageStorage(id) {
            return new SchemeDesigner.ImageStorage(id, this.scheme);
        }
    }
    SchemeDesigner.StorageManager = StorageManager;
    /**
     * Tree node
     */
    class TreeNode {
        /**
         * Constructor
         * @param parent
         * @param boundingRect
         * @param objects
         * @param depth
         */
        constructor(parent, boundingRect, objects, depth) {
            /**
             * Children nodes
             */
            this.children = [];
            /**
             * Objects in node by layers
             */
            this.objectsByLayers = {};
            this.parent = parent;
            this.boundingRect = boundingRect;
            this.objectsByLayers = objects;
            this.depth = depth;
        }
        /**
         * Add child
         * @param child
         */
        addChild(child) {
            this.children.push(child);
        }
        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        getObjects() {
            let result = [];
            for (let layerId in this.objectsByLayers) {
                let objects = this.objectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = [...result, ...objects];
                }
            }
            return result;
        }
        /**
         * Get objects in layer
         * @param layerId
         * @returns {SchemeObject[]}
         */
        getObjectsByLayer(layerId) {
            if (typeof this.objectsByLayers[layerId] != 'undefined') {
                return this.objectsByLayers[layerId];
            }
            return [];
        }
        /**
         * Get objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        getObjectsByLayers() {
            return this.objectsByLayers;
        }
        /**
         * Get children
         * @returns {TreeNode[]}
         */
        getChildren() {
            return this.children;
        }
        /**
         * Is last node
         * @returns {boolean}
         */
        isLastNode() {
            return Object.keys(this.objectsByLayers).length > 0;
        }
        /**
         * Get last children
         * @returns {TreeNode[]}
         */
        getLastChildren() {
            let result = [];
            for (let childNode of this.children) {
                if (childNode.isLastNode()) {
                    result.push(childNode);
                }
                else {
                    let lastChildNodeChildren = childNode.getLastChildren();
                    for (let lastChildNodeChild of lastChildNodeChildren) {
                        result.push(lastChildNodeChild);
                    }
                }
            }
            return result;
        }
        /**
         * Get child by coordinates
         * @param coordinates
         * @returns {TreeNode|null}
         */
        getChildByCoordinates(coordinates) {
            for (let childNode of this.children) {
                if (SchemeDesigner.Tools.pointInRect(coordinates, childNode.getBoundingRect())) {
                    return childNode;
                }
            }
            return null;
        }
        /**
         * Get child by bounding rect
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        getChildrenByBoundingRect(boundingRect) {
            let result = [];
            for (let childNode of this.children) {
                if (SchemeDesigner.Tools.rectIntersectRect(childNode.getBoundingRect(), boundingRect)) {
                    result.push(childNode);
                }
            }
            return result;
        }
        /**
         * Remove objects
         */
        removeObjects() {
            this.objectsByLayers = {};
        }
        /**
         * Get bounding rect
         * @returns {BoundingRect}
         */
        getBoundingRect() {
            return this.boundingRect;
        }
        /**
         * Get  depth
         * @returns {number}
         */
        getDepth() {
            return this.depth;
        }
    }
    SchemeDesigner.TreeNode = TreeNode;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Zoom manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    class ZoomManager {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme) {
            /**
             * Current scale
             */
            this.scale = 1;
            /**
             * Zoom coefficient
             */
            this.zoomCoefficient = 1.04;
            /**
             * Click zoom delta
             */
            this.clickZoomDelta = 14;
            /**
             * Padding for max zoom
             */
            this.padding = 0.1;
            /**
             * Max scale
             */
            this.maxScale = 5;
            /**
             * Zoom by wheel enabled
             */
            this.zoomByWheel = true;
            this.scheme = scheme;
        }
        /**
         * Set zoom
         * @param {number} delta
         * @returns {boolean}
         */
        zoom(delta) {
            let factor = this.getFactorByDelta(delta);
            return this.zoomByFactor(factor);
        }
        /**
         * Get factor by delta
         * @param {number} delta
         */
        getFactorByDelta(delta) {
            return Math.pow(this.zoomCoefficient, delta);
        }
        /**
         * Set scale
         * @param scale
         * @returns {boolean}
         */
        setScale(scale) {
            let factor = this.scale / scale;
            return this.zoomByFactor(factor);
        }
        /**
         * Scale with all objects visible + padding
         * @returns {number}
         */
        getScaleWithAllObjects() {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let maxScaleX = ((boundingRect.right - boundingRect.left) * (this.padding + 1)) / this.scheme.getWidth();
            let maxScaleY = ((boundingRect.bottom - boundingRect.top) * (this.padding + 1)) / this.scheme.getHeight();
            return maxScaleX > maxScaleY ? maxScaleX : maxScaleY;
        }
        /**
         * Max zoom scale
         */
        getMaxZoomScale() {
            const boundingRectDimensions = this.scheme.getStorageManager().getObjectsDimensions();
            const maxX = this.scheme.getWidth() * this.maxScale / boundingRectDimensions.width;
            const maxY = this.scheme.getHeight() * this.maxScale / boundingRectDimensions.height;
            return maxX > maxY ? maxX : maxY;
        }
        /**
         * Min zoom scale
         */
        getMinZoomScale() {
            const boundingRectDimensions = this.scheme.getStorageManager().getObjectsDimensions();
            const minX = this.scheme.getWidth() * (1 - this.padding) / boundingRectDimensions.width;
            const minY = this.scheme.getHeight() * (1 - this.padding) / boundingRectDimensions.height;
            return minX < minY ? minX : minY;
        }
        /**
         * Can zoom by factor
         * @param factor
         */
        canZoomByFactor(factor) {
            let oldScale = this.scale;
            let newScale = oldScale * factor;
            let result = false;
            if (factor < 1) {
                result = this.getMinZoomScale() < newScale;
            }
            else {
                result = this.getMaxZoomScale() > newScale;
            }
            return result;
        }
        /**
         * Zoom by factor
         * @param factor
         * @returns {boolean}
         */
        zoomByFactor(factor) {
            if (this.renderAllTimer) {
                clearTimeout(this.renderAllTimer);
            }
            let oldScale = this.scale;
            let requestedScale = oldScale * factor;
            const maxScale = this.getMaxZoomScale();
            const minScale = this.getMinZoomScale();
            let newScale = requestedScale;
            if (newScale > maxScale) {
                newScale = maxScale;
            }
            if (newScale < minScale) {
                newScale = minScale;
            }
            const canZoom = newScale != oldScale;
            this.scheme.getEventManager().sendEvent('zoom', {
                oldScale: oldScale,
                newScale: newScale,
                factor: factor,
                success: canZoom
            });
            if (canZoom) {
                this.scale = newScale;
                this.scheme.getView().setScale(newScale);
                this.scheme.getView().applyTransformation();
                if (this.scheme.useSchemeCache()) {
                    this.scheme.requestDrawFromCache();
                    this.renderAllTimer = setTimeout(() => { this.scheme.requestRenderAll(); }, 300);
                }
                else {
                    this.scheme.requestRenderAll();
                }
                return true;
            }
            return false;
        }
        /**
         * Get scale
         * @returns {number}
         */
        getScale() {
            return this.scale;
        }
        /**
         * Reset scale
         */
        resetScale() {
            this.scale = 1;
        }
        /**
         * Handle mouse wheel
         * @param e
         * @returns {void|boolean}
         */
        handleMouseWheel(e) {
            if (!this.zoomByWheel) {
                return;
            }
            let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                this.zoomToPointer(e, delta);
            }
            return e.preventDefault() && false;
        }
        /**
         * Zoom to pointer
         * @param e
         * @param delta
         */
        zoomToPointer(e, delta) {
            this.scheme.getEventManager().setLastClientPositionFromEvent(e);
            this.zoomToPoint({
                x: this.scheme.getEventManager().getLastClientX(),
                y: this.scheme.getEventManager().getLastClientY()
            }, delta);
        }
        /**
         * Zoom to center
         * @param delta
         */
        zoomToCenter(delta) {
            this.zoomToPoint({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            }, delta);
        }
        /**
         * Zoom to point
         * @param point
         * @param delta
         */
        zoomToPoint(point, delta) {
            let prevScale = this.scheme.getZoomManager().getScale();
            let zoomed = this.scheme.getZoomManager().zoom(delta);
            if (zoomed) {
                // scroll to cursor
                let newScale = this.scheme.getZoomManager().getScale();
                let prevCenter = {
                    x: point.x / prevScale,
                    y: point.y / prevScale,
                };
                let newCenter = {
                    x: point.x / newScale,
                    y: point.y / newScale,
                };
                let scaleFactor = prevScale / newScale;
                let leftOffsetDelta = (newCenter.x - prevCenter.x) * newScale;
                let topOffsetDelta = (newCenter.y - prevCenter.y) * newScale;
                let scrollLeft = this.scheme.getScrollManager().getScrollLeft() / scaleFactor;
                let scrollTop = this.scheme.getScrollManager().getScrollTop() / scaleFactor;
                this.scheme.getScrollManager().scroll(scrollLeft + leftOffsetDelta, scrollTop + topOffsetDelta);
            }
        }
        /**
         * Set padding
         * @param value
         */
        setPadding(value) {
            this.padding = value;
        }
        /**
         * Set max scale
         * @param value
         */
        setMaxScale(value) {
            this.maxScale = value;
        }
        /**
         * Set zoomCoefficient
         * @param value
         */
        setZoomCoefficient(value) {
            this.zoomCoefficient = value;
        }
        /**
         * Set clickZoomDelta
         * @param value
         */
        setClickZoomDelta(value) {
            this.clickZoomDelta = value;
        }
        /**
         * Get clickZoomDelta
         * @return {number}
         */
        getClickZoomDelta() {
            return this.clickZoomDelta;
        }
        /**
         * Set zoom by wheel
         * @param value
         */
        setZoomByWheel(value) {
            this.zoomByWheel = value;
        }
        /**
         * Get zoom by wheel enabled
         */
        getZoomByWheel() {
            return this.zoomByWheel;
        }
    }
    SchemeDesigner.ZoomManager = ZoomManager;
})(SchemeDesigner || (SchemeDesigner = {}));
