import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
import { Place } from './data/place.js';

export class SchemePlaceSettings extends Observer {


    constructor(form, schemeData) {
        super("PlaceSettings");
        this.schemeData = schemeData;
        this.form = form;
        this.subscribe(this.schemeData.place);

        this.form.placeName.value = this.schemeData.place.name;
        this.form.placeDescription.value = this.schemeData.place.description;
        this.form.placeGuid.value = this.schemeData.place.guid;



        this.form.placeName.onchange = (() => {
            this.schemeData.place.name = this.form.placeName.value;
        });

        this.form.placeDescription.onchange = (() => {
            this.schemeData.place.description = this.form.placeDescription.value;
        });

    }
}