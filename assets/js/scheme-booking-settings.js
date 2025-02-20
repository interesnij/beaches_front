import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
import { BookingSettings } from './data/booking-settings.js';
import { TimeHelper } from './data/time-helper.js';

export class SchemeBookingSettings extends Observer {


    constructor(form, bookingSettings) {
        super("SchemeBookingSettings");
        this.bookingSettings = bookingSettings;
        this.form = form;
        this.subscribe(this.bookingSettings);



        this.form.bookingDate.value = TimeHelper.stringDate(this.bookingSettings.date);
        this.form.bookingTimeStart.value = TimeHelper.stringTime(this.bookingSettings.timeStart);
        this.form.bookingTimeEnd.value = TimeHelper.stringTime(this.bookingSettings.timeEnd);


        this.form.bookingDate.onchange = (() => {
            this.bookingSettings.date = this.form.bookingDate.value;
        });

        this.form.bookingTimeStart.onchange = (() => {
            this.bookingSettings.timeStart = this.form.bookingTimeStart.value;
        });

        this.form.bookingTimeEnd.onchange = (() => {
            this.bookingSettings.timeEnd = this.form.bookingTimeEnd.value;
        });

    }


    update(publisher, action, ...args) {
        this.form.bookingDate.value = TimeHelper.stringDate(publisher.date);
        this.form.bookingTimeStart.value = TimeHelper.stringTime(publisher.timeStart);
        this.form.bookingTimeEnd.value = TimeHelper.stringTime(publisher.timeEnd);
    }
}