"use strict";

class SKU {
    constructor(id, dscrpt, w, v, notes, pos, qty, price) {
        this.id = id;
        this.description = dscrpt;
        this.weight = w;
        this.volume = v;
        this.notes = notes;
        this.position = pos;
        this.availableQuantity = qty;
        this.price = price;
        this.testDescriptors = [];
    }


}

module.exports = SKU;