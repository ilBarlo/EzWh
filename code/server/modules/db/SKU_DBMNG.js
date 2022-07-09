"use strict";
const SKU = require("../backend/SKU");

class SKU_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKU(SKUID INTEGER PRIMARY KEY AUTOINCREMENT,\
                DESCRIPTION VARCHAR,\
                WEIGHT NUMBER NOT NULL,\
                VOLUME NUMBER NOT NULL, \
                NOTES VARCHAR, \
                POSITION VARCHAR, \
                AVAILABLE_QUANTITY INTEGER NOT NULL, \
                PRICE NUMBER NOT NULL)";
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
            const sql = "DELETE FROM SKU";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    deleteSeq = () => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'SKU'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /** SKU */
    getAll_SKU = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU";
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const sku_list = rows.map(record => new SKU(record.SKUID, record.DESCRIPTION || undefined,
                        record.WEIGHT,
                        record.VOLUME,
                        record.NOTES || undefined,
                        record.POSITION || undefined,
                        record.AVAILABLE_QUANTITY,
                        record.PRICE))
                    resolve(sku_list);
                }
            });
        })
    }

    getSKU = (skuid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU WHERE SKUID = ?";
            this.db.get(sql, [skuid], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(row);
                    } else {
                        const sku = new SKU(row.SKUID, row.DESCRIPTION || undefined,
                            row.WEIGHT,
                            row.VOLUME,
                            row.NOTES || undefined,
                            row.POSITION || undefined,
                            row.AVAILABLE_QUANTITY,
                            row.PRICE)
                        resolve(sku);
                    }

                }
            });
        })
    }

    getSKU_byPosition = (posid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU WHERE POSITION = ?";
            this.db.get(sql, [posid], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(row);
                    } else {
                        const sku = new SKU(row.SKUID, row.DESCRIPTION || undefined,
                            row.WEIGHT,
                            row.VOLUME,
                            row.NOTES || undefined,
                            row.POSITION || undefined,
                            row.AVAILABLE_QUANTITY,
                            row.PRICE)
                        resolve(sku);
                    }

                }
            });
        })
    }

    createSKU = (sku) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKU(DESCRIPTION,WEIGHT,VOLUME,NOTES,POSITION,AVAILABLE_QUANTITY,PRICE)\
                             VALUES (?, ?, ?, ?, ?, ?, ?)";
            this.db.run(sql, [sku.description, sku.weight, sku.volume, sku.notes, sku.position, sku.availableQuantity, sku.price], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    modifySKU = (sku) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE SKU SET DESCRIPTION = ?,\
            WEIGHT = ?,\
            VOLUME = ?, \
            NOTES = ?, \
            POSITION = ?, \
            AVAILABLE_QUANTITY = ?, \
            PRICE = ? WHERE SKUID = ?";
            this.db.run(sql, [sku.description, sku.weight, sku.volume, sku.notes, sku.position, sku.availableQuantity, sku.price, sku.id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteSKU = (skuid) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKU WHERE SKUID = ?";
            this.db.run(sql, [skuid], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })

    }


}

module.exports = SKU_DBMNG;