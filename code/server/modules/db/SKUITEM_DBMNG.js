"use strict";

const SKU_ITEM = require("../backend/SKU_Item");

class SKUITEM_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKU_ITEM(RFID VARCHAR PRIMARY KEY,\
                AVAILABLE BOOLEAN NOT NULL,\
                DATE_OF_STOCK VARCHAR,\
                SKUID INTEGER NOT NULL)";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteData = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKU_ITEM";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /**SKUITEM */
    getAll_SKUItems = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU_ITEM";
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const skuitem_list = rows.map(record => new SKU_ITEM(record.RFID, record.SKUID, record.AVAILABLE, record.DATE_OF_STOCK))
                    resolve(skuitem_list);
                }
            });
        })
    }

    getSKUItems_bySKUid = (skuid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU_ITEM WHERE SKUID = ? AND AVAILABLE = TRUE";
            this.db.all(sql, [skuid], (err, rows) => {
                if (err) {
                    reject(err);
                } else {

                    const skuitem_list = rows.map(record => new SKU_ITEM(record.RFID, record.SKUID, record.AVAILABLE, record.DATE_OF_STOCK))

                    resolve(skuitem_list);
                }
            });
        })
    }

    getSKUItem_byRFID = (rfid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU_ITEM WHERE RFID = ?";
            this.db.get(sql, [rfid], (err, record) => {
                if (err) {
                    reject(err);
                } else {
                    if (record === undefined) {
                        resolve(record);
                    } else {
                        const sku_item = new SKU_ITEM(record.RFID, record.SKUID, record.AVAILABLE, record.DATE_OF_STOCK)

                        resolve(sku_item);
                    }

                }
            });
        })
    }

    createSKUItem = (skui) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKU_ITEM(RFID, AVAILABLE, DATE_OF_STOCK, SKUID)\
                             VALUES (?, ?, ?, ?)";
            this.db.run(sql, [skui.RFID, skui.Available, skui.DateOfStock || "NULL", skui.SKUId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    modifySKU_Item = (skui, id) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE SKU_ITEM SET RFID = ?,AVAILABLE=?, DATE_OF_STOCK=? WHERE RFID = ?";
            this.db.run(sql, [skui.RFID, skui.Available, skui.DateOfStock, id], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })

    }

    deleteSKUItem = (rfid) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKU_ITEM WHERE RFID = ?";
            this.db.run(sql, [rfid], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

}

module.exports = SKUITEM_DBMNG;