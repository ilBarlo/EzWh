"use strict";

class Position {
    constructor(id, aisle, r, c, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
        this.positionID = id;
        this.aisleID = aisle;
        this.row = r;
        this.col = c;
        this.maxWeight = maxWeight;
        this.maxVolume = maxVolume;
        this.occupiedWeight = occupiedWeight;
        this.occupiedVolume = occupiedVolume;
    }




}

module.exports = Position;