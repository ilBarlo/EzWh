/**TEST DESCRIPTORS */
"use strict"

const TEST_DESCRIPTOR = require("../backend/Test_Descriptor");

class TEST_DESCRIPTOR_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS TEST_DESCRIPTOR(ID INTEGER PRIMARY KEY AUTOINCREMENT,\
                NAME VARCHAR NOT NULL,\
                PROCEDURE_DESCRIPTION VARCHAR,\
                SKUID INTEGER NOT NULL\
                )";
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
            const sql = "DELETE FROM TEST_DESCRIPTOR";
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
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'TEST_DESCRIPTOR'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }
    getAll_TestDescriptors = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM TEST_DESCRIPTOR";
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const sku_list = rows.map(record => new TEST_DESCRIPTOR(record.ID,
                        record.NAME,
                        record.PROCEDURE_DESCRIPTION,
                        record.SKUID))
                    resolve(sku_list);
                }
            });
        })
    }

    getTestDescriptors_byId = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM TEST_DESCRIPTOR WHERE ID = ?";
            this.db.get(sql, [id], (err, record) => {
                if (err) {
                    reject(err);
                } else {
                    if (record === undefined) {
                        resolve(record);
                    } else {
                        const td = new TEST_DESCRIPTOR(record.ID,
                            record.NAME,
                            record.PROCEDURE_DESCRIPTION,
                            record.SKUID)

                        resolve(td);
                    }

                }
            });
        })
    }

    getTest_DescriptorsID_bySKU = (skuid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM TEST_DESCRIPTOR WHERE SKUID = ?";
            this.db.all(sql, [skuid], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const td_l = rows.map(td => new TEST_DESCRIPTOR(td.ID, td.NAME, td.PROCEDURE_DESCRIPTION, td.SKUID))
                    resolve(td_l);
                }
            });
        })
    }

    createTestDescriptor = (td_i) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO TEST_DESCRIPTOR(NAME,PROCEDURE_DESCRIPTION,SKUID)\
                            VALUES (?, ?, ?)";
            this.db.run(sql, [td_i.name, td_i.procedureDescription, td_i.idSKU], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    modifyTestDescriptor = (td) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE TEST_DESCRIPTOR SET NAME = ?,\
            PROCEDURE_DESCRIPTION  = ?,\
            SKUID  = ?\
            WHERE ID = ?";
            this.db.run(sql, [td.name, td.procedureDescription, td.idSKU, td.id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteTestDescriptor = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM TEST_DESCRIPTOR WHERE ID = ?";
            this.db.run(sql, [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }

    deleteTestDescriptorsBySKUId = (skuid) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM TEST_DESCRIPTOR WHERE SKUID = ?";
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

module.exports = TEST_DESCRIPTOR_DBMNG;