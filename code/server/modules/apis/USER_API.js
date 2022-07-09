"use strict";
const dayjs = require("dayjs");

class USER_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }

    create_handlers() {
        /* USER */
        this.app.get('/api/users', async (req, res) => {
            try {
                const users = await this.EZWH.getAllUsers_butManagers();
                return res.status(200).json(users);
            } catch (err) {
                console.log(err);
                return res.status(500).json({ error: "Generic Error" });
            }
        });

        this.app.get('/api/suppliers', async (req, res) => {
            try {
                const suppliers = await this.EZWH.getSuppliers();
                return res.status(200).json(suppliers);
            } catch (err) {
                console.log(err);
                return res.status(500).json({ error: "Generic Error" });
            }
        });

        this.app.post('/api/newUser', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.name === undefined ||
                    body.surname === undefined || body.password === undefined ||
                    body.type === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                const check_mail = await this.EZWH.checkMail(body.username);
                if (!check_mail) {
                    return res.status(422).json({ error: "Invalid mail!" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                if (body.type === "Manager" || body.type === "Administrator" ||
                    (body.type !== "qualityEmployee" && body.type !== "customer" && body.type !== "clerk" && body.type !== "deliveryEmployee" && body.type !== "supplier")) {
                    return res.status(422).json({ error: "Invalid request body: attempt to create Manager or administrator accounts!" });
                }

                const user = await this.EZWH.getUser(body.username, body.type);
                if (user) {
                    return res.status(409).json({ error: "Conflict: user with same mail and type already exists" });
                } else {
                    await this.EZWH.createUser(body);
                    return res.status(201).json("OK");
                }
            } catch (e) {
                console.log(e);
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.post('/api/supplierSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "supplier");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        /* To debug, manager email: f.barletta14@hotmail.it pw: testmanager */
        this.app.post('/api/managerSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "Manager");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.post('/api/customerSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "customer");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.post('/api/clerkSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "clerk");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.post('/api/qualityEmployeeSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "quality employee");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.post('/api/deliveryEmployeeSessions', async (req, res) => {

            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.username === undefined || body.password === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                if (body.password.length <= 8) {
                    return res.status(422).json({ error: "Invalid request body: password MUST BE AT LEAST 8 characters!" });
                }

                const check_user = await this.EZWH.checkUser(body, "delivery employee");
                return res.status(200).json(check_user);
            } catch (e) {
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/users/:username', async (req, res) => {
            try {
                const body = req.body;
                const username = req.params.username;

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (username === undefined || body.oldType === undefined || body.newType === undefined ||
                    body.newType === "Manager" || body.newType === "adiministrator accounts") {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                const user = await this.EZWH.getUser(username, body.oldType);

                if (!user) {
                    return res.status(404).json({ error: "Not Found" });
                }

                const err = await this.EZWH.modifyRightsUser(username, body);

                if (err) {
                    throw err
                } else {
                    return res.status(200).json("OK");
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.delete('/api/users/:username/:type', async (req, res) => {
            try {
                const username = req.params.username;
                const type = req.params.type;
                if (username === undefined || type === undefined ||
                    type === "manager" || type === "adiministrator accounts" ||
                    type !== 'customer' && type !== "qualityEmployee" &&
                    type !== "clerk" && type !== "deliveryEmployee" && type !== "supplier") {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                const check_mail = await this.EZWH.checkMail(username);
                if (!check_mail) {
                    return res.status(422).json({ error: "Invalid mail!" });
                }

                // const user = await this.EZWH.getUser(username, type);
                // console.log(user)

                // if (!user) {
                //     return res.status(422).json({ error: "Invalid body request" });
                // }

                const err = await this.EZWH.deleteUser(username, type);

                if (err) {
                    throw err
                } else {
                    return res.status(204).json("OK");
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });
    }
}

module.exports = USER_API;