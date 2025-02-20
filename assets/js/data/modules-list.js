import { Publisher } from "./publisher.js";
import { Module } from "./module.js";

export class ModulesList extends Publisher {
    constructor(modules) {
        super();
        this.list = [];
        modules.forEach(item => {
            this.addModule(item);
        });
    }

    toJSON() {
        return this.list;
    }

    //проверяем корректность объекта класса Module    
    checkModule(module) {
        return module instanceof Module;
        //return true;
    }

    findSelected() {
        return this.list.find(element => { return element.isSelected });
    }

    addModule(module) {
        let _module = new Module(module);
        if (!this.checkModule(_module)) {
            console.error(new Error("Не удалось добавить модуль", module));
            return;
        }


        this.list.push(_module)
        _module.subscribe(this);
        this.notifyObservers('insertModule', _module);
    }

    removeModule(_module) {
        this.list = this.list.filter((item) => item.guid !== _module.guid);
        _module.unsubscribe(this);
        this.notifyObservers('deleteModule', _module);
    }

    update(_module, ...args) {
        this.notifyObservers('updateModule', _module, args);
    }

    notifyObservers(action, module, ...args) { // рассылка данных наблюдателям
        for (let observer of this.observersList) {
            observer.update(this, action, module, args);
        }
    }

}