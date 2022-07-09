"use strict";
const dayjs = require("dayjs");

class ITEM_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }

    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num >= 0
    }

    create_handlers() {
        /* ITEM*/
        this.app.get('/api/items', async (req, res) => {
            try {
                const list = await this.EZWH.getAllItem();
                return res.status(200).json(list);
            } catch {
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/items/:id/:supplierId', async (req, res) => {
            try {
                const id = req.params.id;
                const suppid = req.params.supplierId;
                if (this.#isPositiveInteger(id) && this.#isPositiveInteger(suppid)) {
                    const item = await this.EZWH.getItem(id, suppid);
                    if (item !== undefined) {
                        return res.status(200).json(item);
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.post('/api/item', async (req, res) => {
            try {
                const body = req.body;

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }


                if (body.id === undefined || body.description === undefined ||
                    body.price === undefined || body.SKUId === undefined ||
                    body.supplierId === undefined || !this.#isPositiveInteger(body.id)
                    || !this.#isPositiveInteger(body.SKUId) || !this.#isPositiveInteger(body.supplierId)) {

                    return res.status(422).json({ error: "Invalid request body" });
                }
                const check_id_already_exists = await this.EZWH.getItem(id, suppid);
                const check_skuid_already_exists = await this.EZWH.getItemBySKUid(body.SKUId, suppid);

                if (check_id_already_exists !== undefined || check_skuid_already_exists !== undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                const sku = await this.EZWH.getSKU_bySKUid(body.SKUId);

                if (sku) {
                    await this.EZWH.createItem(body);
                    return res.status(201).json("OK");
                } else {
                    return res.status(404).json({ error: "SKU Not Found" });
                }

            } catch (err) {
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });

        this.app.put('/api/item/:id/:supplierId', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;
                const suppid = req.params.supplierId;

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (id === undefined || body.newDescription === undefined ||
                    body.newPrice === undefined || !this.#isPositiveInteger(id) || !this.#isPositiveInteger(suppid) || !this.#isPositiveInteger(body.newPrice)) {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                const item = await this.EZWH.getItem(id, suppid);
                if (!item) {
                    return res.status(404).json({ error: "Item Not Found" });
                }

                const err = await this.EZWH.updateItem(id, suppid, body);
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

        this.app.delete('/api/items/:id/:supplierId', async (req, res) => {
            try {
                const id = req.params.id
                const suppid = req.params.supplierId;

                if (id === undefined || !this.#isPositiveInteger(id) || !this.#isPositiveInteger(suppid)) {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                const err = await this.EZWH.deleteItem(id, suppid);

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

module.exports = ITEM_API;