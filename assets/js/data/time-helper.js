export class TimeHelper {
    static getFullDateTime(date, time) {
        //date - строка
        //time - строка формата HH:mm
        return new Date(this.stringDate(new Date(date)) + " " + time);
    }

    /**
     * Проверяем пересечения периодов
     * @param {*} timePeriod1 
     * @param {*} timePeriod2 
     * @returns true - если периоды пересикаются; false - периоды не пересикаются
     */
    static checkIntersection(timePeriod1, timePeriod2) {
        if (timePeriod1.dateEnd < timePeriod2.dateStart || timePeriod2.dateEnd < timePeriod1.dateStart) return false;
        return true;
    }


    static stringTime(datetime) {
        let hh = '' + datetime.getHours();
        hh = hh.length == 1 ? '0' + hh : hh;
        let mm = '' + datetime.getMinutes();
        mm = mm.length == 1 ? '0' + mm : mm;
        return hh + ":" + mm;
    }

    static stringDate(datetime) {
        return datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + datetime.getDate();
    }
}