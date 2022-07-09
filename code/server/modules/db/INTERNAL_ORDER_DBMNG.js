"use strict";
const INTERNAL_ORDER = require("../backend/Internal_Order");
const SKU = require("../backend/SKU");


class INTERNAL_ORDER_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = async () => {
        await this.#createINTERNAL_ORDERTable();
        await this.#createPRODUCTS_IO_Table();
        await this.#createSKUItemsIO_Table();

    }

    deleteData = async () => {
        await this.deleteDataIO();
        await this.deleteDataPR_IO();
        await this.deleteDataSKU_IO();
    }

    #createINTERNAL_ORDERTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS INTERNAL_ORDER(ID INTEGER PRIMARY KEY AUTOINCREMENT,\
                ISSUE_DATE DATE NOT NULL, \
                STATE VARCHAR NOT NULL,\
                CUSTOMER_ID INTEGER NOT NULL)";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })

    }

    #createPRODUCTS_IO_Table = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS PRODUCTS_INTERNAL_ORDERS (INTERNAL_ORDER_ID,\
            SKU_ID INTEGER NOT NULL,\
            DESCRIPTION VARCHAR,\
            PRICE REAL ,\
            QTY INTEGER NOT NULL,\
            PRIMARY KEY (INTERNAL_ORDER_ID, SKU_ID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    #createSKUItemsIO_Table = () => { /* Used when an IO is completed */
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS SKUITEMS_INTERNAL_ORDERS (INTERNAL_ORDER_ID,\
            SKU_ID INTEGER NOT NULL,\
            DESCRIPTION VARCHAR,\
            PRICE REAL,\
            RFID VARCHAR NOT NULL,\
            PRIMARY KEY (INTERNAL_ORDER_ID, SKU_ID, RFID))";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    deleteData = async () => {
        await this.#deleteDataIO();
        await this.#deleteDataPIO();
        await this.#deleteDataSIO();

    }


    #deleteDataIO = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM INTERNAL_ORDER";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    #deleteDataPIO = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_INTERNAL_ORDERS";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    #deleteDataSIO = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKUITEMS_INTERNAL_ORDERS";
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
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'INTERNAL_ORDER'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /* Internal Order */
    getAll_InternalOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNAL_ORDER";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {

                    const internal_orders = rows.map(row => new INTERNAL_ORDER(
                        row.ID,
                        row.ISSUE_DATE,
                        row.STATE,
                        row.CUSTOMER_ID))

                    resolve(internal_orders);
                }
            });
        });
    }

    getIssued_InternalOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNAL_ORDER WHERE STATE = 'ISSUED' ";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const internal_orders = rows.map(row => new INTERNAL_ORDER(
                        row.ID,
                        row.ISSUE_DATE,
                        row.STATE,
                        row.CUSTOMER_ID))

                    resolve(internal_orders);
                }
            });
        });
    }

    getAccepted_InternalOrders = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNAL_ORDER WHERE STATE = 'ACCEPTED' ";

            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const internal_orders = rows.map(row => new INTERNAL_ORDER(
                        row.ID,
                        row.ISSUE_DATE,
                        row.STATE,
                        row.CUSTOMER_ID))

                    resolve(internal_orders);
                }
            });
        });
    }

    getInternalOrder_byId = (ioid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNAL_ORDER WHERE ID = ?";
            this.db.get(sql, [ioid], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(row);
                    } else {
                        const internal_orders = new INTERNAL_ORDER(
                            row.ID,
                            row.ISSUE_DATE,
                            row.STATE,
                            row.CUSTOMER_ID);

                        resolve(internal_orders);
                    }

                }
            });
        })
    }

    getProducts_IO = (io_id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM PRODUCTS_INTERNAL_ORDERS WHERE INTERNAL_ORDER_ID = ?"
            this.db.all(sql, [io_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }

    getProduct_IO = (io_id) => {
        console.log(io_id)
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKU_ID, DESCRIPTION, PRICE, QTY FROM PRODUCTS_INTERNAL_ORDERS WHERE INTERNAL_ORDER_ID = ?"
            this.db.get(sql, [parseInt(io_id)], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const map = {
                        "SKUId": row.SKU_ID,
                        "description": row.DESCRIPTION,
                        "price": row.PRICE
                    }
                    resolve(map);
                }
            })
        });
    }



    getProducts_CompletedIO = (io_id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKU_ID,DESCRIPTION ,PRICE, RFID FROM SKUITEMS_INTERNAL_ORDERS WHERE INTERNAL_ORDER_ID = ?"
            this.db.all(sql, [io_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        })
    }

    createInternalOrder = (io) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO INTERNAL_ORDER(ISSUE_DATE, STATE, CUSTOMER_ID )\
                         VALUES (?, ?, ?)";
            this.db.run(sql, [io.issue_date, io.state, io.customer_id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    createProducts_IO = (io_id, body) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO PRODUCTS_INTERNAL_ORDERS(INTERNAL_ORDER_ID, SKU_ID,DESCRIPTION,PRICE,QTY )\
                         VALUES (?, ?, ?,?,?)";
            this.db.run(sql, [io_id, body.SKUId, body.description, body.price, body.qty], (err) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    getLastIO = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT MAX(ID) as ID FROM INTERNAL_ORDER"
            this.db.get(sql, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.ID);
                }
            });
        })
    }

    modifyState_InternalOrder = (id, body) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE INTERNAL_ORDER SET STATE = ? WHERE ID = ?";
            this.db.run(sql, [body.newState, id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }


    createSkuItems_inInternalOrder = (id, sku, rfid) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKUITEMS_INTERNAL_ORDERS(INTERNAL_ORDER_ID, SKU_ID,DESCRIPTION,PRICE,RFID )\
                    VALUES (?, ?, ?,?,?)";
            this.db.run(sql, [parseInt(id), parseInt(sku.SKUId), sku.description, sku.price, rfid], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteInternalOrder = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM INTERNAL_ORDER WHERE ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteProducts_IO = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM PRODUCTS_INTERNAL_ORDERS WHERE INTERNAL_ORDER_ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(true);

                }
            });
        })
    }

    deleteSKUItems_IO = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKUITEMS_INTERNAL_ORDERS WHERE INTERNAL_ORDER_ID = ?";
            this.db.run(sql, [parseInt(id)], (err) => {
                if (err) {
                    reject(err);
                    return;
                } else {
                    resolve(true);

                }
            });
        })
    }




}



module.exports = INTERNAL_ORDER_DBMNG;