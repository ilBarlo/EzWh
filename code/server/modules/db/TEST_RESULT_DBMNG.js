"use strict";

const TEST_RESULT = require("../backend/Test_Result");

class TEST_RESULT_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = () => {
        return new Promise((resolve, reject) => {
            const sql =
                'CREATE TABLE IF NOT EXISTS TEST_RESULT(ID INTEGER PRIMARY KEY AUTOINCREMENT,\
                    RFID VARCHAR NOT NULL,\
                    ID_TEST_DESCRIPTOR INTEGER NOT NULL,\
                    DATE DATE VARCHAR NOT NULL,\
                    RESULT BOOLEAN NOT NULL)';

            this.db.run(sql, err => {
                if (err) {
                    reject(err);
                    return
                }
                resolve()
            })
        })
    }

    deleteData = () => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM TEST_RESULT";
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
            const sql = "UPDATE sqlite_sequence SET seq = 0  WHERE name = 'TEST_RESULT'";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }
    /**TEST RESULT */
    getAllTestResults = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM TEST_RESULT'
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    if (rows === undefined)
                        resolve(rows);
                    const testResults = rows.map(tr =>
                        new TEST_RESULT(
                            tr.ID,
                            tr.RFID,
                            tr.ID_TEST_DESCRIPTOR,
                            tr.DATE,
                            tr.RESULT
                        ));
                    resolve(testResults)
                }
            })
        })
    };

    getAllTestResults_byRFID = rfid => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM TEST_RESULT WHERE RFID=?'
            this.db.all(sql, [rfid], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    if (rows === undefined)
                        resolve(rows);
                    const testResults = rows.map(tr =>
                        new TEST_RESULT(
                            tr.ID,
                            tr.RFID,
                            tr.ID_TEST_DESCRIPTOR,
                            tr.DATE,
                            tr.RESULT
                        ));
                    resolve(testResults)
                }
            })
        })
    };

    getTestResult_byId = (id) => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM TEST_RESULT WHERE ID=?'
            this.db.get(sql, [id], (err, record) => {
                if (err) {
                    reject(err)
                } else {
                    if (record === undefined) {
                        resolve(record);
                    } else {
                        const testResult = new TEST_RESULT(
                            record.ID,
                            record.RFID,
                            record.ID_TEST_DESCRIPTOR,
                            record.DATE,
                            record.RESULT
                        );

                        resolve(testResult)
                    }

                }
            });
        });
    };

    createTestResult = (body) => {
        return new Promise((resolve, reject) => {
            const sql =
                'INSERT INTO TEST_RESULT(RFID, ID_TEST_DESCRIPTOR, DATE, RESULT)\
                             VALUES (?, ?, ?, ?)';
            this.db.run(sql, [body.rfid, body.idTestDescriptor, body.Date, body.Result], err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        })
    };

    modifyTestResult = (tr) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE TEST_RESULT SET ID_TEST_DESCRIPTOR = ?,\
            DATE  = ?,\
            RESULT  = ?\
            WHERE ID = ?";
            this.db.run(sql, [tr.idTestDescriptor, tr.Date, tr.Result, tr.id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    };

    deleteTestResult = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM TEST_RESULT WHERE ID = ?";
            this.db.run(sql, [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }




}

module.exports = TEST_RESULT_DBMNG;