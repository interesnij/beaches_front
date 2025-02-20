import { Publisher } from './publisher.js'

export class TypeModule extends Publisher {
    constructor(typeModule) {
        super();
        this._guid = typeModule.guid;
        this._type = typeModule.type;
        this._name = typeModule.name;
        this._description = typeModule.description;
        this._price = typeModule.price;
        this._imageUrl = typeModule.imageUrl;
    }

    toJSON() {
        return {
            guid: this.guid,
            type: this.type,
            name: this.name,
            description: this.description,
            price: this.price,
            imageUrl: this.imageUrl
        }
    }

    get guid() {
        return this._guid;
    }

    set guid(value) {
        if (this._guid !== value) {
            this._guid = value;
            this.notifyObservers(this);
        }
    }

    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type !== value) {
            this._type = value;
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

    get price() {
        return this._price;
    }

    set price(value) {
        if (this._price !== value) {
            this._price = value;
            this.notifyObservers(this);
        }
    }

    get imageUrl() {
        return this._imageUrl;
    }

    set imageUrl(value) {
        if (this._imageUrl !== value) {
            this._imageUrl = value;
            this.notifyObservers(this);
        }
    }

}