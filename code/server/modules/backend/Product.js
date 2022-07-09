'use strict';


class Products {
    constructor(id, sku_id, qty, description, price, item_id) {
        this.id = id;
        this.SKUId = sku_id;
        this.qty = qty;
        this.description = description;
        this.price = price;
        this.itemId = item_id;

    }

}

module.exports = Products;