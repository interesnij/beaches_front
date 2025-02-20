
export class Observer {
    constructor(observerName = 'DefaultObserverName') { // observerName нужен только для наглядности примера
        this.observerName = observerName;
        this.publishers = [];
    }

    toJSON() { }

    subscribe(publisher) {
        if (!publisher) {
            throw new Error('Не указан Publisher (субьект) при создании наблюдателя (Observer)');
        }
        let findPublisher = this.publishers.find(element => { return element === publisher });
        if (findPublisher !== undefined && findPublisher !== null) {
            throw new Error(this.observerName + ' уже подписан на данный субъект');
        }
        publisher.subscribe(this); // при создании наблюдателя автоматически добавляем его в ресстр субьекта
        this.publishers.push(publisher);
    }

    unsubscribe(publisher) {
        this.publisher.unsubscribe(this);
        this.publishers = this.publishers.filter(element => { return element !== publisher });
    }

    update(publisher, ...args) { // получаем данные от Субьекта (Publisher) и вызываем для них функцию-обработчик
        console.log(publisher);
        [...args].forEach((arg) => {
            this.updateHandler(arg);
        });
    }
    updateHandler(arg) { // Обработка новых данных.
        console.log(this.observerName + ': ' + arg);
    }
}