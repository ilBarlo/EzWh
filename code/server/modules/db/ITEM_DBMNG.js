"use strict";
const ITEM = require("../backend/Item");


class ITEM_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS ITEM(ID INTEGER NOT NULL,\
                    DESCRIPTION VARCHAR,\
                    PRICE NUMBER NOT NULL,\
                    SKUID INTEGER NOT NULL,\
                    SUPPLIERID INTEGER NOT NULL,\
                    PRIMARY KEY (ID, SUPPLIERID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });

        })
    }

    deleteData = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM ITEM";
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
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'ITEM'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /**ITEM */
    getAll_Item = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM ITEM"
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    const list = rows.map(
                        item =>
                            new ITEM(
                                item.ID,
                                item.DESCRIPTION,
                                item.PRICE,
                                item.SKUID,
                                item.SUPPLIERID
                            )
                    );
                    resolve(list);

                }

            })
        })
    }

    getItem = (item_id, suppid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM ITEM WHERE ID = ? AND SUPPLIERID = ?"
            this.db.get(sql, [item_id, suppid], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    if (row === undefined) {
                        resolve(row)
                    } else {
                        const item = new ITEM(
                            row.ID,
                            row.DESCRIPTION,
                            row.PRICE,
                            row.SKUID,
                            row.SUPPLIERID
                        )
                        resolve(item);
                    }
                }

            })
        })
    }

    getItemBySKUid = (skuid, suppid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM ITEM WHERE SKUID = ? AND SUPPLIERID = ?"
            this.db.get(sql, [skuid, suppid], (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    if (row === undefined) {
                        resolve(row)
                    } else {
                        const item = new ITEM(
                            row.ID,
                            row.DESCRIPTION,
                            row.PRICE,
                            row.SKUID,
                            row.SUPPLIERID
                        )
                        resolve(item);
                    }
                }

            })
        })
    }

    createItem = (item) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO ITEM(ID, DESCRIPTION, PRICE, SKUID, SUPPLIERID)\
                                                    VALUES (?, ?, ?, ?, ?)";
            this.db.run(sql, [item.id, item.description, item.price, item.SKUId, item.supplierId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    };

    modifyItem = (id, suppid, body) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE ITEM SET DESCRIPTION = ?, PRICE = ? WHERE ID = ? AND SUPPLIERID = ?";
            this.db.run(sql, [body.newDescription, body.newPrice, id, suppid], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    deleteItem = (id, suppid) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM ITEM WHERE ID = ? AND SUPPLIERID = ?";
            this.db.run(sql, [id], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }


}

module.exports = ITEM_DBMNG;