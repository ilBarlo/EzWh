/**TEST DESCRIPTORS */
"use strict";

class TEST_DESCRIPTOR_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }

    create_handlers() {
        this.app.get('/api/testDescriptors', async (req, res) => {
            try {
                const td_list = await this.EZWH.getAll_TestDescriptors();
                return res.status(200).json(td_list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" });
            }
        });

        this.app.get('/api/testDescriptors/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && !isNaN(id)) {

                    const td = await this.EZWH.getTestDescriptors_byId(id);

                    if (td !== undefined) {
                        return res.status(200).json(td);
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                console.log(err);
                return res.status(500).json({ error: "Generic Error" });
            }
        });

        this.app.post('/api/testDescriptor', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {

                    return res.status(422).json({ error: "Empty body request" });
                }
                if (!body.name || !body.procedureDescription || !body.idSKU ||
                    isNaN(body.idSKU)) {

                    return res.status(422).json({ error: "Invalid request body" });
                }
                const sku = await this.EZWH.getSKU_bySKUid(parseInt(body.idSKU));
                if (sku !== undefined) {
                    await this.EZWH.createTestDescriptor(body)
                    return res.status(201).json("OK");
                } else {
                    return res.status(404).json({ error: "Not Found" });
                }


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/testDescriptor/:id', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.id;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (id !== undefined && !isNaN(id)) {
                    const td = await this.EZWH.getTestDescriptors_byId(id)
                    if (td !== undefined) {
                        if (body.newIdSKU !== undefined) {
                            if (!isNaN(body.newIdSKU) && body.newName !== undefined && body.newProcedureDescription !== undefined) {
                                const sku = await this.EZWH.getSKU_bySKUid(parseInt(body.newIdSKU));
                                if (sku === undefined) {
                                    return res.status(404).json({ error: "Not Found: idSKU" });
                                }
                            } else {
                                return res.status(422).json({ error: "Invalid request body" });
                            }

                            await this.EZWH.modifyTestDecriptor(body, id);
                            return res.status(200).json("OK");
                        } else {
                            return res.status(422).json({ error: "Invalid request body" })
                        }
                    } else {
                        return res.status(404).json({ error: "Not Found: testDescriptor" });
                    }
                } else {
                    return res.status(422).json({ error: "Invalid request body" });
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });

            }
        })

        this.app.delete('/api/testDescriptor/:id', async (req, res) => {
            try {
                const id = req.params.id;
                if (id !== undefined && !isNaN(id)) {
                    const td = await this.EZWH.getTestDescriptors_byId(id)
                    if (td !== undefined) {
                        await this.EZWH.deleteTestDescriptor(id);
                        return res.status(204).json();
                    }
                }
                return res.status(422).json({ error: "Validation Error" });

            } catch (err) {
                console.log(err);
                return res.status(503).json({ error: "503 Service Unavailable" });
            }
        });

    }
}

module.exports = TEST_DESCRIPTOR_API