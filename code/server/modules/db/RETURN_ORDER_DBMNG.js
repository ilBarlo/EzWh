"use strict";
const RETURN_ORDER = require("../backend/Return_Order");
const SKU_Item = require("../backend/SKU_Item");


class RETURN_ORDER_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = async () => {
        await this.#createRETURN_ORDERTable();
        await this.#createPRODUCTS_RT_Table();
    }

    deleteData = async () => {
        await this.#deleteDataRO();
        await this.#deleteDataPRO();
    }

    #deleteDataRO = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM RETURN_ORDER";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    #deleteDataPRO = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_RETURN_ORDERS";
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
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'RETURN_ORDER'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    #createRETURN_ORDERTable = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RETURN_ORDER (ID INTEGER PRIMARY KEY AUTOINCREMENT, \
                    RETURN_DATE DATE NOT NULL, \
                    RESTOCK_ORDER_ID INTEGER NOT NULL)";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    #createPRODUCTS_RT_Table = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS PRODUCTS_RETURN_ORDERS (RETURN_ORDER_ID,\
            SKU_ID INTEGER NOT NULL,\
            RFID VARCHAR NOT NULL,\
            ITEMID INTEGER NOT NULL,\
            PRIMARY KEY (RETURN_ORDER_ID, SKU_ID, RFID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    /**RETURN ORDER */
    getAll_ReturnOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RETURN_ORDER";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const return_orders = rows.map(row => new RETURN_ORDER(
                        row.ID,
                        row.RETURN_DATE,
                        row.RESTOCK_ORDER_ID))

                    resolve(return_orders);
                }
            });
        });
    }

    getReturnOrder_byId = (roid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RETURN_ORDER WHERE ID = ?";

            this.db.get(sql, [roid], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const return_order = new RETURN_ORDER(
                        row.ID,
                        row.RETURN_DATE,
                        row.RESTOCK_ORDER_ID)

                    resolve(return_order);

                }
            });
        });
    }

    getReturnOrder_byRSId = (rsid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RETURN_ORDER WHERE RESTOCK_ORDER_ID = ?";

            this.db.all(sql, [rsid], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const return_orders = rows.map(row => new RETURN_ORDER(
                        row.ID,
                        row.RETURN_DATE,
                        row.RESTOCK_ORDER_ID));

                    resolve(return_orders);

                }
            });
        });
    }

    getReturnOrderProducts = (ro_id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKU_ID, RFID FROM PRODUCTS_RETURN_ORDERS WHERE RETURN_ORDER_ID = ?"
            this.db.all(sql, [ro_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const list = rows.map(row => new {
                        "RFID": row.RFID,
                        "SKUId": row.SKU_ID,
                        "itemId": row.ITEMID
                    })
                    resolve(list);
                }
            });
        })
    }

    createReturnOrder = (ro) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO RETURN_ORDER(RETURN_DATE, RESTOCK_ORDER_ID)\
                             VALUES (?, ?)";
            this.db.run(sql, [ro.returnDate, ro.restockOrderId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    createReturnProduct = (ro_id, body) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO PRODUCTS_RETURN_ORDERS(RETURN_ORDER_ID, SKU_ID, RFID, ITEMID)\
                             VALUES (?, ?, ?, ?)";
            this.db.run(sql, [ro_id, body.SKUId, body.RFID, body.itemId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    getLastRO = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT MAX(ID) as ID FROM RETURN_ORDER"
            this.db.get(sql, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        })
    }

    deleteReturnOrder = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM RETURN_ORDER WHERE ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    deleteProducts_byRO = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_RETURN_ORDERS WHERE RETURN_ORDER_ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }


}

module.exports = RETURN_ORDER_DBMNG;