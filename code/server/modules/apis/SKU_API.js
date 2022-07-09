"use strict";

class SKU_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }
    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num >= 0
    }
    create_handlers() {
        /* SKU */
        console.log("creating sku apis")
        this.app.get('/api/skus', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_SKU();
                return res.status(200).json(list);
            } catch {
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.get('/api/skus/:id', async (req, res) => {
            try {
                const id = req.params.id
                if (this.#isPositiveInteger(id)) {
                    const sku = await this.EZWH.getSKU_bySKUid(id);
                    if (sku !== undefined) {
                        return res.status(200).json(sku);
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

        this.app.post('/api/sku', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {

                    return res.status(422).json({ error: "Empty body request" });
                }
                if (body.description === undefined || body.description === "" || body.weight === undefined || !this.#isPositiveInteger(body.weight) ||
                    body.volume === undefined || !this.#isPositiveInteger(body.volume) || body.notes === undefined || body.notes === "" ||
                    body.price === undefined || !this.#isPositiveInteger(body.price) || body.availableQuantity === undefined || !this.#isPositiveInteger(body.availableQuantity)) {

                    return res.status(422).json({ error: "Invalid request body" });
                }
                await this.EZWH.createSKU(body)
                return res.status(201).json("OK");

            } catch (err) {
                console.log(err);
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/sku/:id', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                const pos = await this.EZWH.getAll_Positions();
                if (id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Invalid request body" });
                } else {
                    const sku = await this.EZWH.getSKU_bySKUid(id)
                    if (sku !== undefined) {
                        const posid = sku.position;
                        if (posid !== undefined) {
                            const pos = await this.EZWH.getPosition(posid);

                            if (body.newWeight !== undefined && body.newVolume !== undefined && body.newAvailableQuantity !== undefined) {
                                if (!this.#isPositiveInteger(body.newWeight) || !this.#isPositiveInteger(body.newVolume) || !this.#isPositiveInteger(body.newAvailableQuantity) ||
                                    pos.maxWeight < (body.newAvailableQuantity * body.newWeight) || pos.maxVolume < (body.newAvailableQuantity * body.newVolume)) {

                                    return res.status(422).json({ error: "Invalid request body: not enough space" });
                                }
                            }
                            if (body.newWeight !== undefined && body.newVolume !== undefined && body.newAvailableQuantity === undefined) {
                                if (!this.#isPositiveInteger(body.newWeight) || !this.#isPositiveInteger(body.newVolume) ||
                                    pos.maxWeight < (sku.availableQuantity * body.newWeight) || pos.maxVolume < (sku.availableQuantity * body.newVolume)) {
                                    return res.status(422).json({ error: "Invalid request body: not enough space" });
                                }
                            }
                            if (body.newWeight === undefined && body.newVolume === undefined && body.newAvailableQuantity != undefined) {
                                if (!this.#isPositiveInteger(body.newAvailableQuantity) ||
                                    pos.maxWeight < (body.newAvailableQuantity * sku.weight) || pos.maxVolume < (body.newAvailableQuantity * sku.volume)) {
                                    return res.status(422).json({ error: "Invalid request body: not enough space" });
                                }
                            }
                        }
                        if ((body.newWeight !== undefined && !this.#isPositiveInteger(body.newWeight)) || (body.newVolume !== undefined && !this.#isPositiveInteger(body.newVolume)) || (body.newAvailableQuantity !== undefined && !this.#isPositiveInteger(body.newAvailableQuantity)) || (body.newPrice !== undefined && !this.#isPositiveInteger(body.newPrice))) {
                            return res.status(422).json({ error: "Invalid request body" });
                        }
                        await this.EZWH.modifySKU(id, body)
                        return res.status(200).json("OK");


                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/sku/:id/position', async (req, res) => {
            try {
                const body = req.body.position;
                const id = req.params.id;
                const pos = await this.EZWH.getPosition(body);
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (id === undefined || !this.#isPositiveInteger(id) || pos === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                } else {
                    const sku = await this.EZWH.getSKU_bySKUid(id);
                    const skus = await this.EZWH.getAll_SKU();
                    const isAssigned = skus.map(s => s.position).includes(body);


                    if (sku !== undefined) {
                        if (isAssigned || pos.maxWeight < sku.weight * sku.availableQuantity || pos.maxVolume < sku.volume * sku.availableQuantity) {
                            return res.status(422).json({ error: "Invalid request body" });
                        } else {
                            await this.EZWH.modifySKU(id, req.body);
                            return res.status(200).json("OK");
                        }
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });

            }
        })

        this.app.delete('/api/skus/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Unprocessable Entity" });
                }
                await this.EZWH.deleteSKU(id)
                return res.status(204).send(" ");
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });
    }
}

module.exports = SKU_API