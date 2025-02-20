import { Observer } from "./observer.js";
import { ImageStorageItem } from "./image-storage-item.js";
export class ImageStorage extends Observer {

    constructor() {
        super("ImageStorage");
        this.storage = [];
        this._backgroundImage = null;
        this._gridImage = null;
    }

    subscribe(publisher) {
        if (!publisher) {
            throw new Error('Не указан Publisher (субьект) при создании наблюдателя (Observer)');
        }
        if (this.publisher !== undefined && this.publisher !== null) {
            throw new Error(this.observerName + ' уже подписан на субъект');
        }
        publisher.list.forEach(item => {
            this.addImageStorage(item);
        });
        publisher.subscribe(this); // при создании наблюдателя автоматически добавляем его в ресстр субьекта
        this.publisher = publisher;
    }

    unsubscribe() {
        if (this.publisher !== undefined && this.publisher !== null) {
            this.publisher.unsubscribe(this);
            this.publisher = null;
        }
    }

    update(publisher, typeModule, ...args) { // получаем данные от Субьекта (Publisher) и вызываем для них функцию-обработчик
        this.addImageStorage(typeModule);
    }

    addImageStorage(typeModule) {
        if (this.isExists(typeModule)) {
            throw new Error(typeModule.guid + ' уже загружен в storageImage');
        }
        if (typeModule.imageUrl !== null && typeModule.imageUrl !== undefined)
            this.storage.push(new ImageStorageItem(typeModule));
    }

    removeImageStorage(typeModule) {
        this.storage = this.storage.filter((item) => item.guid !== typeModule.guid);
    }

    clear() {
        this.storage = [];
    }

    isExists(typeModule) {
        if (this.storage.length == 0) return false;
        let fnd = this.storage.find(item => item.guid == typeModule.guid);
        return fnd !== undefined;
    }

    getImage(typeModule) {
        let storageItem = this.storage.find(item => item.guid == typeModule.guid);
        if (storageItem == undefined) {
            throw new Error(typeModule.guid + ' не найден storageImage');
        }
        return storageItem.image;
    }

    getBackgroundImage() {
        return this._backgroundImage;
    }

    setBackgroundImage(imageUrl) {
        this._backgroundImage = new Image();
        this._backgroundImage.src = imageUrl;
    }

}