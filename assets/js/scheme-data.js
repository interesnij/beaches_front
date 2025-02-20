import { Place } from './data/place.js';
import { ModulesList } from './data/modules-list.js';
import { TypeModulesList } from './data/type-modules-list.js';
import { ImageStorage } from './data/image-storage.js';
import { Settings } from './data/settings.js';
import { Workspace } from './data/workspace.js';
import { BookingList } from './data/booking-list.js';
import { BookingSettings } from './data/booking-settings.js';

export class SchemeData {

    constructor(JSON) {
        this.place = new Place(JSON?.place);
        this.typeModulesList = new TypeModulesList(JSON?.typeModules);
        this.modulesList = new ModulesList(JSON?.modules)
        this.imageStorage = new ImageStorage();
        this.imageStorage.subscribe(this.typeModulesList);
        this.settings = new Settings(JSON?.settings);
        this.workspace = new Workspace(JSON?.workspace);
        this.bookingList = JSON?.bookings !== undefined ? new BookingList(JSON?.bookings) : null;


        this.bookingSettings = JSON?.bookings !== undefined ? new BookingSettings() : null;
    }


    toJSON() {
        return {
            version: "0.1",
            place: this.place,
            workspace: this.workspace,
            settings: this.settings,
            typeModules: this.typeModulesList,
            modules: this.modulesList,
            bookings: this.bookingList
        }
    }

    subscribeToDataPlace(obj) {
        this.place.subscribe(obj);
    }

    unsubscribeFromDataPlace(obj) {
        this.place.unsubscribe(obj);
    }

    subscribeToTypeModulesList(obj) {
        this.typeModulesList.subscribe(obj);
    }

    unsubscribeFromTypeModulesList(obj) {
        this.typeModulesList.unsubscribe(obj);
    }

    subscribeToModulesList(obj) {
        this.modulesList.subscribe(obj);
    }

    unsubscribeFromModulesList(obj) {
        this.modulesList.unsubscribe(obj);
    }

    subscribeToWorkspace(obj) {
        this.workspace.subscribe(obj);
    }

    unsubscribeFromWorkspace(obj) {
        this.workspace.unsubscribe(obj);
    }

    subscribeToBookingList(obj) {
        this.bookingList.subscribe(obj);
    }

    unsubscribeFromBookingList(obj) {
        this.bookingList.unsubscribe(obj);
    }
}
