"use strict";
const dayjs = require("dayjs");

class INTERNAL_ORDER_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }

    create_handlers() {

        /* APIs for Internal Order */

        this.app.get('/api/internalOrders', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_InternalOrders();
                (list);
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });


        this.app.get('/api/internalOrdersIssued', async (req, res) => {
            try {
                const list = await this.EZWH.getIssued_InternalOrders();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/internalOrdersAccepted', async (req, res) => {
            try {
                const list = await this.EZWH.getAccepted_InternalOrders();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/internalOrders/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (!isNaN(id)) {

                    const internal_order = await this.EZWH.getInternalOrder_byId(id);

                    if (internal_order !== undefined) {
                        return res.status(200).json(internal_order);
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" });
            }
        });

        this.app.post('/api/internalOrders', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (body.issueDate === undefined || body.customerId === undefined ||
                    body.products === undefined || isNaN(body.customerId)) {

                    return res.status(422).json({ error: "Invalid request body" });
                }
                await this.EZWH.createInternalOrder(body);
                return res.status(201).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/internalOrders/:id', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;


                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (isNaN(id) || body.newState === undefined) {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                if (body.newState === 'COMPLETED' && body.products === undefined) {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                const check_InternalOrder = await this.EZWH.getInternalOrder_byId(id);
                if (!check_InternalOrder) {
                    return res.status(404).json({ error: "Not found" });
                }
                await this.EZWH.modifyState_InternalOrder(id, body);
                return res.status(200).json("OK");
            }
            catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });

        this.app.delete('/api/internalOrders/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const io_list = await this.EZWH.getAll_InternalOrders();
                if (id === undefined || isNaN(id) || !io_list.map(io => io.id).includes(parseInt(id))) {
                    return res.status(422).json({ error: "Unprocessable Entity" });
                }
                await this.EZWH.deleteInternalOrder(id);
                return res.status(204).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });


    }


}

module.exports = INTERNAL_ORDER_API;