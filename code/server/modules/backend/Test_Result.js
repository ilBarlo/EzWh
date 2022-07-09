"use strict";

class Test_Result {
    constructor(id, RFID, idTestDescriptor, date, result) {
        this.id = id;
        this.rfid = RFID
        this.idTestDescriptor = idTestDescriptor;
        this.Date = date;
        this.Result = result === 1 || result === true ? true : false;

    }


}

module.exports = Test_Result;