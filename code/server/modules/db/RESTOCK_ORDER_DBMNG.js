"use strict";
const RESTOCK_ORDER = require("../backend/Restock_Order");
const PRODUCT = require("../backend/Product");
const SKU_Item = require("../backend/SKU_Item");



class RESTOCK_ORDER_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = async () => {
        await this.#createRESTOCK_ORDERTable();
        await this.#createPRODUCTS_RS_Table();
        await this.#createSKUITEMS_RS_Table();

    }
    deleteData = async () => {
        await this.deleteDataRS();
        await this.deleteDataPR_RS();
        await this.deleteDataSK_RS();
    }
    deleteSeq = () => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'RESTOCK_ORDER'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }
    deleteDataRS = async () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM RESTOCK_ORDER";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }
    deleteDataPR_RS = async () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_RESTOCK_ORDERS";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }
    deleteDataSK_RS = async () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKUITEMS_RESTOCK_ORDERS";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }


    #createRESTOCK_ORDERTable = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS RESTOCK_ORDER (ID INTEGER PRIMARY KEY AUTOINCREMENT,\
            SUPPLIER_ID INTEGER NOT NULL,\
            STATE VARCHAR NOT NULL,\
            ISSUE_DATE DATE NOT NULL,\
            TRANSPORT_NOTE VARCHAR)";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    #createPRODUCTS_RS_Table = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS PRODUCTS_RESTOCK_ORDERS (SKU_ID INTEGER NOT NULL,\
            RESTOCK_ORDER_ID INTEGER NOT NULL,\
            QTY INTEGER NOT NULL,\
            DESCRIPTION INTEGER NOT NULL,\
            PRICE INTEGER NOT NULL,\
            ITEMID INTEGER NOT NULL, \
            PRIMARY KEY (RESTOCK_ORDER_ID, SKU_ID, ITEMID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    #createSKUITEMS_RS_Table = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKUITEMS_RESTOCK_ORDERS (SKU_ID INTEGER NOT NULL,\
            RESTOCK_ORDER_ID INTEGER NOT NULL,\
            RFID VARCHAR NOT NULL,\
            ITEMID INTEGER NOT NULL,\
            PRIMARY KEY (RESTOCK_ORDER_ID, SKU_ID, RFID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    /* RESTOCK ORDERS */
    getAll_RestockOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCK_ORDER";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const restock_orders = rows.map(row => new RESTOCK_ORDER(
                        row.ID,
                        row.SUPPLIER_ID,
                        row.STATE,
                        row.ISSUE_DATE || undefined,
                        row.TRANSPORT_NOTE || undefined))

                    resolve(restock_orders);
                }
            });
        });
    }

    getAll_Issued_RestockOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCK_ORDER WHERE STATE = 'ISSUED' ";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const restock_orders = rows.map(row => new RESTOCK_ORDER(
                        row.ID,
                        row.SUPPLIER_ID,
                        row.STATE,
                        row.ISSUE_DATE || undefined,
                        row.TRANSPORT_NOTE || undefined))

                    resolve(restock_orders);
                }
            });
        });
    }

    getRestockOrder_byId = (roid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCK_ORDER WHERE ID = ?";
            this.db.get(sql, [roid], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(row);
                    } else {
                        const restock_orders = new RESTOCK_ORDER(
                            row.ID,
                            row.SUPPLIER_ID,
                            row.STATE,
                            row.ISSUE_DATE || undefined,
                            row.TRANSPORT_NOTE || undefined);

                        resolve(restock_orders);
                    }

                }
            });
        })
    }

    createRestockOrder = (ro) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO RESTOCK_ORDER(SUPPLIER_ID, STATE, ISSUE_DATE)\
                             VALUES (?, ?, ?)";
            this.db.run(sql, [ro.supplierId, ro.state, ro.issueDate], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    getProducts = (ro_id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM PRODUCTS_RESTOCK_ORDERS WHERE RESTOCK_ORDER_ID = ?";

            this.db.all(sql, [ro_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const products = rows.map(row => new PRODUCT(
                        row.RESTOCK_ORDER_ID,
                        row.SKU_ID,
                        row.QTY,
                        row.DESCRIPTION,
                        row.PRICE,
                        row.ITEMID));

                    resolve(products);
                }
            });
        });
    }

    getSKUItem_RS = (ro_id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKU_ID, RFID, ITEMID FROM SKUITEMS_RESTOCK_ORDERS WHERE RESTOCK_ORDER_ID = ?"
            this.db.all(sql, [ro_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {

                    const skuis = rows.map(row => { return { "rfid": row.RFID, "SKUId": row.SKU_ID, "itemId": row.ITEMID } })
                    resolve(skuis);
                }
            });
        })
    }

    getLastRS = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT MAX(ID) as ID FROM RESTOCK_ORDER"
            this.db.get(sql, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.ID);
                }
            });
        })
    }

    addSkuItems_toRestockOrder = (skuid, id, rfid, itemid) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKUITEMS_RESTOCK_ORDERS(SKU_ID, RESTOCK_ORDER_ID, RFID, ITEMID)\
                             VALUES (?, ?, ?)";
            this.db.run(sql, [parseInt(skuid), parseInt(id), rfid, itemid], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    createProduct = (ro_id, sku, qty, itemid) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO PRODUCTS_RESTOCK_ORDERS(SKU_ID, RESTOCK_ORDER_ID, QTY, DESCRIPTION, PRICE, ITEMID)\
                             VALUES (?, ?, ?, ? ,?, ? )";
            this.db.run(sql, [sku.id, ro_id, qty, sku.description, sku.price, itemid], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    modifyState_RestockOrder = (id, newState) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE RESTOCK_ORDER SET STATE = ? WHERE ID = ?";
            this.db.run(sql, [newState, id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    addTransportNote_toRestockOrder = (transportNote, id) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE RESTOCK_ORDER SET TRANSPORT_NOTE = ? WHERE ID = ?";
            this.db.run(sql, [transportNote.deliveryDate, id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteRestockOrder = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM RESTOCK_ORDER WHERE ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteProducts_byRS = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_RESTOCK_ORDERS WHERE RESTOCK_ORDER_ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }
    deleteSKUItems_byRS = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKUITEMS_RESTOCK_ORDERS WHERE RESTOCK_ORDER_ID = ?";
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

module.exports = RESTOCK_ORDER_DBMNG;