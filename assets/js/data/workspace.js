import { Publisher } from './publisher.js'

export class Workspace extends Publisher {
    constructor(workspace) {
        super();
        this._placeGuid = workspace.placeGuid;// "C85B7E02-8B1C-4C2F-B4FE-7CD52314DCE2",
        this._width = workspace.width;
        this._height = workspace.height;
        this._backgroundGuid = workspace.backgroundGuid;

    }

    toJSON() {
        return {
            placeGuid: this._placeGuid,
            width: this._width,
            height: this._height,
            backgroundGuid: this._backgroundGuid
        };
    }

    get placeGuid() {
        return this._id;
    }

    set placeGuid(value) {
        if (this._id !== value) {
            this._id = value;
            this.notifyObservers();
        }
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.notifyObservers();
        }
    }

    get height() {
        return this._height;
    }

    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.notifyObservers();
        }
    }

    get backgroundGuid() {
        return this._backgroundGuid;
    }

    set backgroundGuid(value) {
        if (this._backgroundGuid !== value) {
            this._backgroundGuid = value;
            this.notifyObservers();
        }
    }

    notifyObservers(...args) { // рассылка данных наблюдателям
        for (let observer of this.observersList) {
            observer.update(this, 'background', args);
        }
    }

}