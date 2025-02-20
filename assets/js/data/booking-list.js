import { Publisher } from './publisher.js';
import { Booking } from './booking.js';

export class BookingList extends Publisher {
    constructor(bookings) {
        super("BookingList");
        this.list = [];
        bookings.forEach(item => {
            this.addBookingItem(item);
        });
    }

    toJSON() {
        return this.list;
    }

    addBookingItem(booking) {
        let _booking = new Booking(booking);
        if (!this.checkBooking(_booking)) {
            console.error(new Error('Не удалось бронирование', _booking));
            return;
        }
        this.list.push(_booking)
        _booking.subscribe(this);
        this.notifyObservers('insertBooking', _booking);
    }

    checkBooking(booking) {
        return booking instanceof Booking;
    }


    removeBookingItem(booking) {
        this.list = this.list.filter((item) => item !== booking);
        booking.unsubscribe(this);
        this.notifyObservers('deleteBooking', booking);
    }

    update(booking, ...args) {
        this.notifyObservers('updateBooking', booking);
    }

    notifyObservers(action, booking) { // рассылка данных наблюдателям
        for (let observer of this.observersList) {
            observer.update(this, action, booking);
        }
    }


}
