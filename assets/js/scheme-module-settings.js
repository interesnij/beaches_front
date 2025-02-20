import { SchemeData } from './scheme-data.js';
import { Observer } from './data/observer.js';
import { Module } from './data/module.js';

export class SchemeModuleSettings extends Observer {


    constructor(form, schemeData) {
        super("ModuleSettings");
        this.schemeData = schemeData;
        this.form = form;
        this.subscribe(this.schemeData.modulesList);
        this.module = null;

        this.form.settingsAngle.onchange = (() => {
            if (this.module != null) {
                this.module.angle = this.form.settingsAngle.value >> 0;
            }
        });

        this.form.settingsLeft.onchange = (() => {
            if (this.module != null) {
                this.module.left = this.form.settingsLeft.value >> 0;
            }
        });

        this.form.settingsTop.onchange = (() => {
            if (this.module != null) {
                this.module.top = this.form.settingsTop.value >> 0;
            }
        });

        this.form.settingsWidth.onchange = (() => {
            if (this.module != null) {
                this.module.width = this.form.settingsWidth.value >> 0;
            }
        });

        this.form.settingsHeight.onchange = (() => {
            if (this.module != null) {
                this.module.height = this.form.settingsHeight.value >> 0;
            }
        });

        this.form.settingsName.onchange = (() => {
            if (this.module != null) {
                this.module.name = this.form.settingsName.value;
            }
        });

        this.form.settingsLabel.onchange = (() => {
            if (this.module != null) {
                this.module.label = this.form.settingsLabel.value;
            }
        });

        this.form.settingsPrice.onchange = (() => {
            if (this.module != null) {
                this.module.price = this.form.settingsPrice.value;
            }
        });
    }

    update(publisher, action, module, ...args) {
        if (module.isSelected) {
            this.module = module;
            this.form.settingsGuid.value = module.guid;
            this.form.settingsName.value = module.name;
            this.form.settingsLabel.value = module.label;
            this.form.settingsWidth.value = module.width >> 0;
            this.form.settingsHeight.value = module.height >> 0;
            this.form.settingsTop.value = module.top >> 0;
            this.form.settingsLeft.value = module.left >> 0;
            this.form.settingsAngle.value = module.angle >> 0;
            this.form.settingsPrice.value = module.price >> 0;
        } else {
            if (publisher.list.find(element => { return element.isSelected }) == null) {
                this.module = null;
                this.form.settingsGuid.value = '';
                this.form.settingsName.value = '';
                this.form.settingsLabel.value = '';
                this.form.settingsWidth.value = '';
                this.form.settingsHeight.value = '';
                this.form.settingsTop.value = '';
                this.form.settingsLeft.value = '';
                this.form.settingsAngle.value = '';
                this.form.settingsPrice.value = '';
            }
        }

    }
}


