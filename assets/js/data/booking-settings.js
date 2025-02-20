import { Publisher } from "./publisher.js";
import { TimeHelper } from "./time-helper.js";
import { TimePeriod } from "./classes.js";

export class BookingSettings extends Publisher {
    constructor() {
        super();
        this._date = new Date();
        this._timeStart = new Date();
        this._timeEnd = new Date();
        this._timeEnd.setHours(this._timeStart.getHours() + 1);
    }

    get date() {
        return this._date;
    }

    set date(value) {
        let date = new Date(value);
        if (this._date !== date) {
            this._date = date;
            this._timeStart = new Date(date.toDateString() + ' ' + this._timeStart.toTimeString());
            this._timeEnd = new Date(date.toDateString() + ' ' + this._timeEnd.toTimeString());
            this.notifyObservers("updateBookingSettings");
        }
    }

    get timeStart() {
        return this._timeStart;
    }

    set timeStart(value) {
        let timeStart = new Date(this._date.toDateString() + ' ' + value);
        if (this._timeStart !== timeStart) {
            this._timeStart = timeStart;
            this._timeEnd = new Date(this.date.toDateString() + ' ' + this._timeEnd.toTimeString());
            if (this._timeStart > this._timeEnd) {
                this._timeEnd = new Date(this._timeStart)
                this._timeEnd.setHours(this._timeStart.getHours() + 1);
            }
            this.notifyObservers("updateBookingSettings");
        }
    }

    get timeEnd() {
        return this._timeEnd;
    }

    set timeEnd(value) {
        let timeEnd = new Date(this._date.toDateString() + ' ' + value);
        if (this._timeEnd !== timeEnd) {
            this._timeEnd = timeEnd;
            if (this._timeEnd < this._timeStart) {
                this._timeEnd = new Date(this._timeStart);
                this._timeEnd.setHours(this._timeStart.getHours() + 1);
            }
            this.notifyObservers("updateBookingSettings");
        }
    }

    notifyObservers(action) {
        for (let observer of this.observersList) {
            observer.update(this, action);
        }
    }

    getPeriod() {
        return new TimePeriod(this._timeStart, this._timeEnd);
    }
}