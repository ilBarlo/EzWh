"use strict";
const dayjs = require('dayjs');

class SKUITEM_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }

    create_handlers() {
        /* SKUITEM */
        this.app.get('/api/skuitems', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_SKUItems(res);
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/skuitems/sku/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && !isNaN(id)) {
                    const sku_list = await this.EZWH.getSKUItems_bySKUid(id);

                    if (sku_list.length > 0) {
                        return res.status(200).json(sku_list);
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

        this.app.get('/api/skuitems/:rfid', async (req, res) => {
            try {
                const rfid = req.params.rfid;
                if (!isNaN(rfid)) {

                    const skuItem = await this.EZWH.getSKUItem_byRFID(rfid);

                    if (skuItem !== undefined) {
                        return res.status(200).json(skuItem);
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

        this.app.post('/api/skuitem', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                const list_skui = await this.EZWH.getAll_SKUItems()
                if (
                    body.RFID === undefined || isNaN(body.RFID) ||
                    body.SKUId === undefined || isNaN(body.SKUId) ||
                    body.DateOfStock === undefined ||
                    (body.DateOfStock !== dayjs(body.DateOfStock).format("YYYY/MM/DD") &&
                        body.DateOfStock !== dayjs(body.DateOfStock).format("YYYY/MM/DD HH:mm"))) {
                    return res.status(422).json({ error: "Invalid request body" });
                }
                const list_sku = await this.EZWH.getAll_SKU();
                if (list_sku.map(sku => sku.id).includes(body.SKUId)) {
                    await this.EZWH.createSKUItem(body)
                    return res.status(201).json("OK");
                } else {
                    return res.status(404).json({ error: "Not Found" });

                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });

        this.app.put('/api/skuitems/:rfid', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.rfid;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (id !== undefined && !isNaN(id)) {
                    if (body.newRFID !== undefined) {
                        if (isNaN(body.newRFID)) {
                            return res.status(422).json({ error: "Invalid request body -rfid" });
                        }
                    }
                    if (body.newAvailable !== undefined) {
                        if (body.newAvailable !== 1 && body.newAvailable !== 0) {
                            return res.status(422).json({ error: "Invalid request body -av" });
                        }
                    }
                    if (body.newDateOfStock !== undefined) {
                        if (body.newDateOfStock !== dayjs(body.newDateOfStock).format("YYYY/MM/DD") &&
                            body.newDateOfStock !== dayjs(body.newDateOfStock).format("YYYY/MM/DD HH:mm")) {
                            return res.status(422).json({ error: "Invalid request body -date" });
                        }
                    }
                    const skui_list = await this.EZWH.getAll_SKUItems();
                    if (skui_list.map(s => s.RFID).includes(id)) {
                        await this.EZWH.modifySKU_Item(body, id);
                        return res.status(200).json("OK");
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Invalid request body: rfid invalid" });
                }


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });

            }
        });

        this.app.delete('/api/skuitems/:rfid', async (req, res) => {
            try {
                const rfid = req.params.rfid;
                if (rfid !== undefined && !isNaN(rfid)) {
                    const skuitem = await this.EZWH.getSKUItem_byRFID(rfid);
                    if (skuitem !== undefined) {
                        await this.EZWH.deleteSKUItem(rfid);

                        return res.status(204).json("OK");
                    }
                }
                return res.status(422).json({ error: "Unprocessable Entity" });

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });
    }
}

module.exports = SKUITEM_API