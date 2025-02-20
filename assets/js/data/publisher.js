export class Publisher { // субьект, получает и рассылает данные
    constructor() {
        this.observersList = []; // реестр наблюдателей (подписчиков)        
    }

    toJSON() { }

    subscribe(obj) { // подписка наблюдателя
        let tmp = this.observersList.find(element => { return element === obj });
        if (tmp !== undefined && tmp !== null) {
            throw new Error(obj + ' уже подписан на данный субъект');
        }
        return this.observersList.push(obj);
    }
    unsubscribe(obj) { // отписка наблюдателя
        this.observersList = this.observersList.filter((item) => item !== obj);
        return this.observersList;
    }
    notifyObservers(...args) { // рассылка данных наблюдателям
        for (let observer of this.observersList) {
            observer.update(this, args);
        }
    }
}
