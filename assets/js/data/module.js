import { Publisher } from './publisher.js';
import { UUID } from './guid.js';

export class Module extends Publisher {
    constructor(module) {
        super();

        this._guid = UUID.checkUUID(module.guid) ? module.guid : UUID.createUUID();
        this._name = module.name;
        this._objectName = module.objectName;
        this._typeModulesGuid = module.typeModulesGuid;
        this._width = module.width >> 0;
        this._height = module.height >> 0;
        this._left = module.left >> 0;
        this._top = module.top >> 0;
        this._label = module.label;
        this._price = module.price;

        this._angle = module.angle >> 0;
        this._fontColor = module.fontColor;
        this._fontSize = module.fontSize;
        this._backColor = module.backColor;
        this._isSelected = false;
    }


    toJSON() {
        return {
            guid: this.guid,
            name: this.name,
            objectName: this.objectName,
            typeModulesGuid: this.typeModulesGuid,
            width: this.width,
            height: this.height,
            left: this.left,
            top: this.top,
            label: this.label,
            price: this.price,
            angle: this.angle,
            fontColor: this.fontColor,
            fontSize: this.fontSize,
            backColor: this.backColor
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


    get name() {
        return this._name;
    }

    set name(value) {
        if (this._name !== value) {
            this._name = value;
            this.notifyObservers(this);
        }
    }

    get objectName() {
        return this._objectName;
    }

    set objectName(value) {
        if (this._objectName !== value) {
            this._objectName = value;
            this.notifyObservers(this);
        }
    }

    get typeModulesGuid() {
        return this._typeModulesGuid;
    }

    set typeModulesGuid(value) {
        if (this._typeModulesGuid !== value) {
            this._typeModulesGuid = value;
            this.notifyObservers(this);
        }
    }

    get width() {
        return this._width;
    }

    set width(value) {
        if (this._width !== value) {
            this._width = value;
            this.notifyObservers(this);
        }
    }

    get height() {
        return this._height;
    }

    set height(value) {
        if (this._height !== value) {
            this._height = value;
            this.notifyObservers(this);
        }
    }

    get label() {
        return this._label;
    }

    set label(value) {
        if (this._label !== value) {
            this._label = value;
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

    get left() {
        return this._left;
    }

    set left(value) {
        if (this._left !== value) {
            this._left = value;
            this.notifyObservers(this);
        }
    }



    get top() {
        return this._top;
    }

    set top(value) {
        if (this._top !== value) {
            this._top = value;
            this.notifyObservers(this);
        }
    }

    setCoordinates(x, y) {
        if (this._top !== y || this._left !== x) {
            this._top = y;
            this._left = x;
            this.notifyObservers(this);
        }
    }


    get angle() {
        return this._angle;
    }

    set angle(value) {
        if (this._angle !== value) {
            this._angle = value;
            this.notifyObservers(this);
        }
    }

    get fontColor() {
        return this._fontColor;
    }

    set fontColor(value) {
        if (this._fontColor !== value) {
            this._fontColor = value;
            this.notifyObservers(this);
        }
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        if (this._fontSize !== value) {
            this._fontSize = value;
            this.notifyObservers(this);
        }
    }

    get backColor() {
        return this._backColor;
    }

    set backColor(value) {
        if (this._backColor !== value) {
            this._backColor = value;
            this.notifyObservers(this);
        }
    }

    get isSelected() {
        return this._isSelected;
    }

    set isSelected(value) {
        if (this._isSelected !== value) {
            this._isSelected = value;
            this.notifyObservers(this);
        }
    }
}