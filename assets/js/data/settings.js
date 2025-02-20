import { Publisher } from './publisher.js';
import { Options, Scroll, Zoom, Storage } from './classes.js';
export class Settings extends Publisher {
    constructor(settings) {
        super();
        if (!this.checkPlaceGuid(settings)) throw Error('Отсутствует настройка settings.placeGuid');
        //if (!this.checkOptions(settings)) throw Error('Не корректная настройка settings.options');
        //if (!this.checkScroll(settings)) throw Error('Не корректная настройка settings.scroll');
        //if (!this.checkZoom(settings)) throw Error('Не корректная настройка settings.zoom');
        //if (!this.checkStorage(settings)) throw Error('Не корректная настройка settings.storage');

        this._placeGuid = settings.placeGuid;
        this._options = new Options(settings.options);
        this._scroll = new Scroll(settings.scroll);
        this._zoom = new Zoom(settings.zoom);
        this._storage = new Storage(settings.storage);
    }

    toJSON() {
        return {
            placeGuid: this.placeGuid,
            options: this.options,
            scroll: this.scroll,
            zoom: this.zoom,
            storage: this.storage
        };
    }

    /**
     * 	"options": {
            "cacheSchemeRatio": false
        },
        "scroll": {
            "draggable": true,
            "draggableLeft": true,
            "draggableTop": true,
            "maxHiddenPart": 0.5
        },
        "zoom": {
            "padding": 0.1,
            "maxScale": 8,
            "zoomCoefficient": 1.04
        },
        "storage": {
            "treeDepth": 6
        }
     * 
     * 
     */

    checkPlaceGuid(settings) {
        return settings.placeGuid !== undefined && settings.placeGuid !== null;
    }

    checkOptions(settings) {
        return settings.options instanceof Options;
    }

    checkScroll(settings) {
        return settings.scroll instanceof Scroll;
    }

    checkZoom(settings) {
        return settings.zoom instanceof Zoom;
    }

    checkStorage(settings) {
        return settings.storage instanceof Storage;
    }

    get placeGuid() {
        return this._placeGuid;
    }

    get options() {
        return this._options;
    }

    set options(value) {
        if (this._options !== value) {

            this._options = value;
            this.notifyObservers(this);
        }
    }

    get scroll() {
        return this._scroll;
    }


    set scroll(value) {
        if (this._scroll !== value) {
            this._scroll = value;
            this.notifyObservers(this);
        }
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(value) {
        if (this._zoom !== value) {
            this._zoom = value;
            this.notifyObservers(this);
        }
    }

    get storage() {
        return this._storage;
    }

    set storage(value) {
        if (this._storage !== value) {
            this._storage = value;
            this.notifyObservers(this);
        }
    }
}