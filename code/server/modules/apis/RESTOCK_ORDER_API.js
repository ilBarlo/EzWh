"use strict";
const dayjs = require("dayjs");

class RESTOCK_ORDER_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }
    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num >= 0
    }

    create_handlers() {
        /* RESTOCK ORDER */
        this.app.get('/api/restockOrders', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_RestockOrders();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/restockOrdersIssued', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_Issued_RestockOrders();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/restockOrders/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && this.#isPositiveInteger(id)) {
                    const restock_order = await this.EZWH.getRestockOrder_byId(id);
                    if (restock_order !== undefined) {
                        return res.status(200).json(restock_order);
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

        this.app.get('/api/restockOrders/:id/returnItems', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && this.#isPositiveInteger(id)) {
                    const ro_list = await this.EZWH.getAll_RestockOrders();
                    if (!ro_list.map(ro => ro.id).includes(parseInt(id))) {
                        return res.status(404).json({ error: "Not Found" });
                    } else {
                        const skui_list = await this.EZWH.getSKUItemsToBeReturned_byRestockOrderID(id);

                        return res.status(200).json(skui_list);
                    }
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.post('/api/restockOrder', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                const req_skus = body.products.map(p => p.SKUId)
                const skus = await this.EZWH.getAll_SKU();
                let areIncluded = true;
                req_skus.forEach(element => { areIncluded = areIncluded && skus.map(s => s.id).includes(element) })

                if (body.issueDate === undefined || body.supplierId === undefined ||
                    body.products === undefined || !this.#isPositiveInteger(body.supplierId) ||
                    !areIncluded || (body.issueDate !== dayjs(body.issueDate).format("YYYY/MM/DD HH:mm") &&
                        body.issueDate !== dayjs(body.issueDate).format("YYYY/MM/DD"))) {
                    return res.status(422).json({ error: "Invalid request body" });
                }

                for (let p of body.products) {
                    const item = await this.EZWH.getItem(p.itemId, body.supplierId);
                    const item2 = await this.EZWH.getItemBySKUid(p.SKUId, body.supplierId);

                    if (item === undefined || item2.id !== p.itemId) {
                        return res.status(422).json({ error: "Invalid request body" });
                    }
                }

                await this.EZWH.createRestockOrder(body);
                return res.status(201).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/restockOrder/:id/skuItems', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (id === undefined || !this.#isPositiveInteger(id) || body.skuItems === undefined) {
                    return res.status(422).json({ error: "Invalid body request 1" });
                }
                const req_rfids = body.skuItems.map(s => s.rfid);
                const req_skus = body.skuItems.map(s => s.SKUId)
                let skus = await this.EZWH.getAll_SKU();
                let skuis = await this.EZWH.getAll_SKUItems();
                skus = skus.map(s => s.id);
                skuis = skuis.map(s => s.RFID);

                let areIncluded = true;
                let areCorrect = true;


                req_skus.forEach(element => { areIncluded = areIncluded && skus.includes(element) });
                req_rfids.forEach(element => { areCorrect = areCorrect && (element !== undefined && this.#isPositiveInteger(element)) });

                const ro_list = await this.EZWH.getAll_RestockOrders();

                if (!ro_list.map(ro => ro.id).includes(parseInt(id))) {
                    return res.status(404).json({ error: "Not Found" });
                }

                const ro = await this.EZWH.getRestockOrder_byId(parseInt(id));

                if (!areIncluded || !areCorrect || ro.state !== "DELIVERED") {

                    return res.status(422).json({ error: "Invalid body request" });
                }

                for (let p of body.skuItems) {
                    if (p.itemId === undefined || !this.#isPositiveInteger(p.itemId)) {
                        return res.status(422).json({ error: "Invalid body request" });

                    }
                }

                await this.EZWH.addSkuItems_toRestockOrder(body.skuItems, id)


                return res.status(200).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/restockOrder/:id/transportNote', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }

                if (id === undefined || !this.#isPositiveInteger(id) || body.transportNote === undefined ||
                    body.transportNote.deliveryDate === undefined || !dayjs(body.transportNote.deliveryDate).isValid()) {
                    return res.status(422).json({ error: "Invalid body request" });
                }
                const ro_list = await this.EZWH.getAll_RestockOrders();

                if (!ro_list.map(ro => ro.id).includes(parseInt(id))) {
                    return res.status(404).json({ error: "Not Found" });
                }

                const ro = await this.EZWH.getRestockOrder_byId(parseInt(id));
                if (ro.state !== "DELIVERY" ||
                    dayjs(ro.issueDate).isAfter(dayjs(body.transportNote.deliveryDate))) {
                    return res.status(422).json({ error: "Invalid body request 2" });
                }
                await this.EZWH.addTransportNote_toRestockOrder(body.transportNote, id)

                return res.status(200).json("OK");

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/restockOrder/:id', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;
                const ro_list = await this.EZWH.getAll_RestockOrders();

                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (!this.#isPositiveInteger(id) || body.newState === undefined ||
                    !(body.newState === "DELIVERY" ||
                        body.newState === "DELIVERED" || body.newState === "TESTED" ||
                        body.newState === "COMPLETEDRETURN" || body.newState === "COMPLETED")) {
                    return res.status(422).json({ error: "Invalid body request" });
                }

                if (!ro_list.map(ro => ro.id).includes(parseInt(id))) {
                    console.log("here")
                    return res.status(404).json({ error: "Not Found" });
                }
                await this.EZWH.modifyState_RestockOrder(id, body.newState);

                return res.status(200).json("OK");


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.delete('/api/restockOrder/:id', async (req, res) => {
            try {
                const id = req.params.id;

                if (id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Unprocessable Entity" });
                }
                await this.EZWH.deleteRestockOrder(id)
                return res.status(204).json("OK");


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });
    }
}

module.exports = RESTOCK_ORDER_API;