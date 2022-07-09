"use strict";

class TEST_RESULT_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }
    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num > 0
    }

    create_handlers() {
        /*TEST RESULT*/
        this.app.get('/api/skuitems/:rfid/testResults', async (req, res) => {
            try {
                const rfid = req.params.rfid;

                if (rfid !== undefined && !isNaN(rfid)) {
                    const skui = await this.EZWH.getSKUItem_byRFID(rfid);
                    if (skui !== undefined) {
                        const testResult_list = await this.EZWH.getAllTestResults_byRFID(rfid);
                        return res.status(200).json(testResult_list);
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

        this.app.get('/api/skuitems/:rfid/testResults/:id', async (req, res) => {
            try {
                const rfid = req.params.rfid;
                const id = req.params.id;
                if (rfid !== undefined && id !== undefined && !isNaN(rfid) && !isNaN(id)) {
                    const testResult = await this.EZWH.getTestResult_byId(id, rfid);
                    if (testResult !== undefined) {
                        return res.status(200).json(testResult);
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

        this.app.post('/api/skuitems/testResult', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (body.rfid === undefined || !this.#isPositiveInteger(body.rfid) || body.idTestDescriptor === undefined || isNaN(body.idTestDescriptor) ||
                    body.Date === undefined || body.Result === undefined) {
                    return res.status(422).json({ error: "Invalid request body" });
                }
                const skui = await this.EZWH.getSKUItem_byRFID(req.body.rfid);
                const td = await this.EZWH.getTestDescriptors_byId(req.body.idTestDescriptor);
                if (td !== undefined && skui !== undefined) {
                    await this.EZWH.createTestResult(body);
                    return res.status(201).json("OK");
                } else {
                    return res.status(404).json({ error: "Not Found" });
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });

        this.app.put('/api/skuitems/:rfid/testResult/:id', async (req, res) => {
            try {
                const body = req.body;
                const rfid = req.params.rfid;
                const id = req.params.id;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (id !== undefined && rfid !== undefined) {
                    if (body.newIdTestDescriptor === undefined || isNaN(body.newIdTestDescriptor) ||
                        body.newDate === undefined || body.newResult === undefined || !this.#isPositiveInteger(rfid)) {
                        return res.status(422).json({ error: "Invalid request body" });
                    }
                    const skui = await this.EZWH.getSKUItem_byRFID(rfid);
                    const td = await this.EZWH.getTestDescriptors_byId(req.body.newIdTestDescriptor);
                    const tr = await this.EZWH.getTestResult_byId(id, rfid);
                    (skui, tr, td)
                    if (td !== undefined && skui !== undefined && tr !== undefined) {
                        await this.EZWH.modifyTestResult(body, id);
                        return res.status(200).json("OK");
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }
                } else {
                    return res.status(422).json({ error: "Invalid request body" });
                }
            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        })

        this.app.delete('/api/skuitems/:rfid/testResult/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const rfid = req.params.rfid;
                if (id !== undefined && rfid !== undefined && !isNaN(id) && !isNaN(rfid)) {
                    const tr = await this.EZWH.getTestResult_byId(id, rfid)
                    if (tr === undefined) {
                        return res.status(422).json({ error: "Validation Error" });
                    }
                    await this.EZWH.deleteTestResult(id);
                    return res.status(204).json("OK");
                } else {
                    return res.status(422).json({ error: "Validation Error" });
                }
            } catch (err) {
                console.log(err);
                return res.status(503).json({ error: "503 Service Unavailable" });
            }
        });
    }
}

module.exports = TEST_RESULT_API;