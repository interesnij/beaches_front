import { Publisher } from "./publisher.js";
import { TypeModule } from "./type-module.js";

export class TypeModulesList extends Publisher {
    constructor(typeModules) {
        super();
        this.list = [];
        typeModules.forEach(item => {
            this.addTypeModule(item);
        });
    }

    toJSON() {
        return this.list;
    }

    //проверяем корректность объекта класса Module    
    checkTypeModule(typeModule) {
        return typeModule instanceof TypeModule;
        //return true;
    }

    addTypeModule(typeModule) {
        let _typeModule = new TypeModule(typeModule);
        if (!this.checkTypeModule(_typeModule)) {
            console.error(new Error('Не удалось добавить тип модуля', _typeModule));
            return;
        }
        this.list.push(_typeModule)
        _typeModule.subscribe(this);
        this.notifyObservers(_typeModule);
    }

    removeTypeModule(typeModule) {
        this.list = this.list.filter((item) => item !== typeModule);
        typeModule.unsubscribe(this);
        this.notifyObservers();
    }

    update(typeModule, ...args) {
        this.notifyObservers(typeModule);
    }

    notifyObservers(typeModule) { // рассылка данных наблюдателям
        for (let observer of this.observersList) {
            observer.update(this, typeModule);
        }
    }
}