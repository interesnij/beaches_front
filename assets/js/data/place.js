import { Publisher } from './publisher.js';

export class Place extends Publisher {
    constructor(place) {
        super();
        this._id = place.id;
        this._name = place.name;
        this._description = place.description;
        this._guid = place.guid;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            guid: this.guid
        };
    }

    get id() {
        return this._id;
    }

    set id(value) {
        if (this._id !== value) {
            this._id = value;
            this.notifyObservers(this);
        }
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (this._name !== value) {
            this._name = value;
            this.notifyObservers(this);
        }
    }

    get description() {
        return this._description;
    }

    set description(value) {
        if (this._description !== value) {
            this._description = value;
            this.notifyObservers(this);
        }
    }

    get guid() {
        return this._guid;
    }
    /*
        set guid(value) {
            if (this._guid !== value) {
                this._guid = value;
                this.notifyObservers(this);
            }
        }
    */


}
