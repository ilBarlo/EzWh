"use strict";
const POSITION = require("../backend/Position");


class POSITION_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS POSITION(POSITIONID VARCHAR PRIMARY KEY,\
                AISLEID VARCHAR NOT NULL,\
                ROW VARCHAR NOT NULL,\
                COL VARCHAR NOT NULL, \
                MAX_WEIGHT INTEGER NOT NULL, \
                MAX_VOLUME INTEGER NOT NULL, \
                OCCUPIED_WEIGHT INTEGER NOT NULL, \
                OCCUPIED_VOLUME INTEGER NOT NULL)";
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
            const sql = "DELETE FROM POSITION";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /**POSITION */
    getAll_Positions = () => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM POSITION";
            this.db.all(sql, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const position_list = rows.map(record => new POSITION(
                        record.POSITIONID,
                        record.AISLEID,
                        record.ROW,
                        record.COL,
                        record.MAX_WEIGHT,
                        record.MAX_VOLUME,
                        record.OCCUPIED_WEIGHT,
                        record.OCCUPIED_VOLUME
                    ))
                    resolve(position_list);
                }
            });
        })
    }

    getPosition = (posid) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM POSITION WHERE POSITIONID = ?";
            this.db.get(sql, [posid], (err, record) => {
                if (err) {
                    reject(err);
                } else {
                    if (record === undefined) {
                        resolve(record);
                    } else {
                        const pos = new POSITION(record.POSITIONID, record.AISLEID, record.ROW, record.COL, record.MAX_WEIGHT, record.MAX_VOLUME, record.OCCUPIED_WEIGHT, record.OCCUPIED_VOLUME)

                        resolve(pos);
                    }

                }
            });
        })
    }

    createPosition = (pos) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO POSITION(POSITIONID, AISLEID, ROW, COL, MAX_WEIGHT, MAX_VOLUME, OCCUPIED_WEIGHT, OCCUPIED_VOLUME)\
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            this.db.run(sql, [pos.positionID,
            pos.aisleID,
            pos.row,
            pos.col,
            pos.maxWeight,
            pos.maxVolume,
                0,
                0], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
        })
    }

    modifyPosition = (pos, id) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE POSITION SET POSITIONID = ?, \
            AISLEID = ?,\
            ROW  = ?,\
            COL  = ?,\
            MAX_WEIGHT  = ?,\
            MAX_VOLUME  = ?,\
            OCCUPIED_WEIGHT  = ?,\
            OCCUPIED_VOLUME  = ?\
            WHERE POSITIONID = ?";
            this.db.run(sql, [pos.positionID,
            pos.aisleID,
            pos.row,
            pos.col,
            pos.maxWeight,
            pos.maxVolume,
            pos.occupiedWeight,
            pos.occupiedVolume, id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })

    }

    modifyPositionID = (pos, oldid) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE POSITION SET POSITIONID = ?, \
            AISLEID = ?,\
            ROW  = ?,\
            COL  = ?\
            WHERE POSITIONID = ?";
            this.db.run(sql, [pos.positionID,
            pos.aisleID,
            pos.row,
            pos.col, oldid], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })

    }

    deletePosition = (id) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM POSITION WHERE POSITIONID = ?";
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

module.exports = POSITION_DBMNG;