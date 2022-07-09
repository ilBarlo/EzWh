'use strict';

class Return_Order {
    constructor(id, return_date, restockOrderId, products) {
        this.id = id;
        this.returnDate = return_date;
        this.restockOrderId = restockOrderId;
        this.products = [];
    }

}

module.exports = Return_Order;