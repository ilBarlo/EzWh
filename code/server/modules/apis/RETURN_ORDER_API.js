"use strict";
const dayjs = require("dayjs");

class RETURN_ORDER_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }
    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num >= 0
    }

    create_handlers() {
        /*RETURN ORDER*/
        this.app.get('/api/returnOrders', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_ReturnOrders();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/returnOrders/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && this.#isPositiveInteger(id)) {
                    let rt_list = await this.EZWH.getAll_ReturnOrders();
                    rt_list = rt_list.map(r => r.id);
                    if (rt_list.includes(parseInt(id))) {
                        const return_order = await this.EZWH.getReturnOrder_byId(id);
                        return res.status(200).json(return_order);
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.post('/api/returnOrder', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (!body.returnDate || !body.restockOrderId ||
                    !body.products || !this.#isPositiveInteger(body.restockOrderId)) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                for (let p of body.products) {
                    if (p.SKUId === undefined || !this.#isPositiveInteger(p.SKUId) ||
                        p.itemId === undefined || !this.#isPositiveInteger(p.itemId) ||
                        p.RFID === undefined || !this.#isPositiveInteger(p.RFID) ||
                        p.description === undefined || p.price === undefined) {
                        return res.status(422).json({ error: "Invalid request body" });
                    }

                }
                // const req_skuis = body.products.map(p => p.RFID)
                // let skuis = await this.EZWH.getSKUItems_RestockOrder_byId(body.restockOrderId);

                // skuis = skuis.map(s => s.rfid)
                // let areIncluded = true;
                // req_skuis.forEach(element => { areIncluded = areIncluded && skuis.includes(element) })
                // if (!areIncluded) {
                //     console.log("here")
                //     return res.status(422).json({ error: "SKUItems are not in restock order" });
                // }

                const ro_list = await this.EZWH.getAll_RestockOrders();

                if (!ro_list.map(ro => ro.id).includes(parseInt(body.restockOrderId))) {
                    return res.status(404).json({ error: "Not Found" });
                }
                await this.EZWH.createReturnOrder(body);
                return res.status(201).json("OK");
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.delete('/api/returnOrder/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const ro_list = await this.EZWH.getAll_ReturnOrders();

                if (id === undefined || !this.#isPositiveInteger(id) || !ro_list.map(ro => ro.id).includes(parseInt(id))) {
                    return res.status(422).json({ error: "Unprocessable Entity" });
                }
                const err = await this.EZWH.deleteReturnOrder(id);


                return res.status(204).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });
    }
}

module.exports = RETURN_ORDER_API;