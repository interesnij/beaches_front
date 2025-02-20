export class ImageStorageItem {
    constructor(typeModule) {
        this.image = new Image();
        this.image.src = typeModule.imageUrl;
        this.guid = typeModule.guid;
    }
}