"use strict";


class SKU_Item {


    constructor(rfid, skuid, available, date_of_stock) {
        this.RFID = rfid;
        this.SKUId = skuid;
        this.Available = available;
        this.DateOfStock = date_of_stock;
        this.test_results = [];
    }




}

module.exports = SKU_Item;