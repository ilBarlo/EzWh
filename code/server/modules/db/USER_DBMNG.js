"use strict";
const USER = require("../backend/User");


class USER_DBMNG {
    sqlite = require('sqlite3');

    constructor(dbname) {
        this.db = new this.sqlite.Database(dbname, (err) => {
            if (err) throw err;
        });
    }

    createTable = async () => {
        return new Promise((resolve, reject) => {
            const sql = "CREATE TABLE IF NOT EXISTS USER(ID INTEGER PRIMARY KEY AUTOINCREMENT,\
                    EMAIL VARCHAR NOT NULL,\
                    PASSWORD VARCHAR NOT NULL,\
                    NAME VARCHAR NOT NULL,\
                    SURNAME VARCHAR NOT NULL,\
                    TYPE VARCHAR NOT NULL)";
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
            const sql = "DELETE FROM USER";
            this.db.run(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        });
    }

    /**USER */
    getAllUsers = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM USER';
            this.db.all(sql, (err, users) => {
                if (err) {
                    reject(err)
                } else {
                    const map = users.map(
                        user =>
                            new USER(
                                user.ID,
                                user.NAME,
                                user.SURNAME,
                                user.EMAIL,
                                user.TYPE
                            )
                    );
                    resolve(map);
                }
            })
        })
    };

    getAllUsers_butManagers = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM USER WHERE TYPE != "Manager" ';
            this.db.all(sql, (err, users) => {
                if (err) {
                    reject(err)
                } else {
                    const map = users.map(
                        user =>
                            new USER(
                                user.ID,
                                user.NAME,
                                user.SURNAME,
                                user.EMAIL,
                                user.TYPE
                            )
                    );
                    resolve(map);
                }
            })
        })
    };

    getSuppliers = () => {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT ID, NAME, SURNAME, EMAIL FROM USER WHERE TYPE="supplier"';
            this.db.all(sql, (err, users) => {
                if (err) {
                    reject(err)
                } else {
                    const map = users.map(
                        user =>
                            new USER(
                                user.ID,
                                user.NAME,
                                user.SURNAME,
                                user.EMAIL
                            )
                    );
                    resolve(map);
                }
            })
        })
    };

    createUser = (user) => {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO USER(EMAIL,PASSWORD,NAME,SURNAME,TYPE)\
                                                    VALUES (?, ?, ?,?,?)";
            this.db.run(sql, [user.email, user.password, user.name, user.surname, user.type], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    };

    checkUser = (user) => {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM USER WHERE EMAIL = ? AND TYPE = ?";
            this.db.all(sql, [user.email, user.type], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                const map = rows.map(
                    user =>
                        new USER(
                            user.ID,
                            user.NAME,
                            user.SURNAME,
                            user.EMAIL,
                            user.TYPE,
                            user.PASSWORD
                        )
                );

                resolve(map);
            })
        })
    };

    getUser = (mail, type) => {
        return new Promise((resolve, reject) => {

            const sql = "SELECT * FROM USER WHERE EMAIL = ? AND TYPE = ?";
            this.db.all(sql, [mail, type], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const map = rows.map(
                    user =>
                        new USER(
                            user.ID,
                            user.NAME,
                            user.SURNAME,
                            user.EMAIL,
                            user.TYPE,
                            user.PASSWORD
                        )
                );

                resolve(map);
            })
        })
    };

    updateUser = (username, body) => {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE USER SET TYPE = ? WHERE EMAIL = ? AND TYPE = ?";
            this.db.run(sql, [body.newType, username, body.oldType], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }

    deleteUser = (username, type) => {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM USER WHERE EMAIL = ? AND TYPE = ?";
            this.db.run(sql, [username, type], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        })
    }


}

module.exports = USER_DBMNG;
