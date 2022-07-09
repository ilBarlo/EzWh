'use strict';

const SKU = require("./SKU");

class Restock_Order {
    constructor(id, supplierId, state, issueDate, transportNote, products, SKUItemList) {
        this.id = id;
        this.supplierId = supplierId;
        this.state = state;
        this.issueDate = issueDate;
        this.transportNote = transportNote;
        this.skuItems = [];
        this.products = [];
    }

}

module.exports = Restock_Order;