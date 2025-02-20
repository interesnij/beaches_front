/*
          "options": {
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

        "options": {
            "cacheSchemeRatio": 2
        },

*/

export class Options {
    constructor(options) {
        this.cacheSchemeRatio = options.cacheSchemeRatio;
    }
}

export class Scroll {
    constructor(scroll) {
        this.draggable = scroll.draggable;
        this.draggableLeft = scroll.draggableLeft;
        this.draggableTop = scroll.draggableTop;
        this.maxHiddenPart = scroll.maxHiddenPart;
    }
}

export class Zoom {
    constructor(zoom) {
        this.padding = zoom.padding;
        this.maxScale = zoom.maxScale;
        this.zoomCoefficient = zoom.zoomCoefficient;
    }
}

export class Storage {
    constructor(storage) {
        this.treeDepth = storage.treeDepth;
    }
}

export class TimePeriod {
    constructor(dateStart, dateEnd) {
        this.dateStart = dateStart > dateEnd ? dateEnd : dateStart;
        this.dateEnd = dateStart > dateEnd ? dateStart : dateEnd;
    }
}

export class Draw {
    // A utility function to draw a rectangle with rounded corners.

    static roundedRect(ctx, x, y, width, height, radius) {
        //ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.arcTo(x, y + height, x + radius, y + height, radius);
        ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
        ctx.arcTo(x + width, y, x + width - radius, y, radius);
        ctx.arcTo(x, y, x, y + radius, radius);
        //ctx.stroke();
    }
}