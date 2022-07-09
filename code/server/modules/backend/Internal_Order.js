'use strict';

class Internal_Order {
    constructor(id, issue_date, state, customer_id, products) {
        this.id = id;
        this.issue_date = issue_date;
        this.state = state;
        this.customer_id = customer_id;
        this.products = [];

    }

}

module.exports = Internal_Order;
