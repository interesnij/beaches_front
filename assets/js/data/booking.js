import { Publisher } from './publisher.js';
import { UUID } from './guid.js';
import { TimeHelper } from "./time-helper.js";
import { TimePeriod } from './classes.js';


export class Booking extends Publisher {
    constructor(booking) {
        super();
        this._guid = UUID.checkUUID(booking.guid) ? booking.guid : UUID.createUUID();
        this._moduleGuid = booking.moduleGuid;
        this._date = new Date(booking.date);
        this._timeStart = TimeHelper.getFullDateTime(booking.date, booking.timeStart);
        this._timeEnd = TimeHelper.getFullDateTime(booking.date, booking.timeEnd);
        this._isMyBooking = booking.isMyBooking;
    }



    toJSON() {
        return {
            guid: this.guid,
            moduleGuid: this.moduleGuid,
            date: TimeHelper.stringDate(this.date),
            timeStart: TimeHelper.stringTime(this.timeStart),
            timeEnd: TimeHelper.stringTime(this.timeEnd),
            isMyBooking: this.isMyBooking
        }
    }

    getPeriod() {
        return new TimePeriod(this._timeStart, this._timeEnd);
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

    get moduleGuid() {
        return this._moduleGuid;
    }

    set moduleGuid(value) {
        if (this._moduleGuid !== value) {
            this._moduleGuid = value;
            this.notifyObservers(this);
        }
    }

    get date() {
        return this._date;
    }

    set date(value) {
        if (this._date !== value) {
            this._date = value;
            this.notifyObservers(this);
        }
    }

    get timeStart() {
        return this._timeStart;
    }

    set timeStart(value) {
        if (this._timeStart !== value) {
            this._timeStart = value;
            this.notifyObservers(this);
        }
    }

    get timeEnd() {
        return this._timeEnd;
    }

    set timeEnd(value) {
        if (this._timeEnd !== value) {
            this._timeEnd = value;
            this.notifyObservers(this);
        }
    }

    get isMyBooking() {
        return this._isMyBooking;
    }

    set isMyBooking(value) {
        if (this._isMyBooking !== value) {
            this._isMyBooking = value;
            this.notifyObservers(this);
        }
    }
}