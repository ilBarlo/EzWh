"use strict";

class POSITION_API {
    constructor(app, EZWH) {
        this.app = app;
        this.EZWH = EZWH;
    }
    #isPositiveInteger(num) {
        return !isNaN(num) && Number.isInteger(Number(num)) && num >= 0
    }
    create_handlers() {

        /* POSITION */
        this.app.get('/api/positions', async (req, res) => {
            try {
                const list = await this.EZWH.getAll_Positions();
                return res.status(200).json(list);
            } catch (err) {
                console.log(err)
                return res.status(500).json({ error: "Generic Error" })
            }
        });

        this.app.post('/api/position', async (req, res) => {
            try {
                const body = req.body;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                if (body.positionID === undefined || body.aisleID === undefined ||
                    body.row === undefined || body.col === undefined ||
                    body.maxWeight === undefined || !this.#isPositiveInteger(body.maxWeight) || body.maxVolume === undefined || !this.#isPositiveInteger(body.maxWeight)) {
                    ("fake here 1")
                    return res.status(422).json({ error: "Invalid request body 1" });
                }
                const validatedPosID = body.aisleID + body.row + body.col
                if (validatedPosID !== body.positionID || body.aisleID.length !== 4 ||
                    body.row.length !== 4 || body.col.length !== 4
                ) {
                    ("fake here 2")

                    return res.status(422).json({ error: "Invalid request body 2" });
                }
                await this.EZWH.createPosition(body);

                return res.status(201).json("OK");


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }

        });

        this.app.put('/api/position/:positionID', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.positionID;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                const list_positions = await this.EZWH.getAll_Positions();
                if (body.newAisleID === undefined ||
                    body.newRow === undefined || body.newCol === undefined ||
                    !this.#isPositiveInteger(body.newAisleID) || !this.#isPositiveInteger(body.newCol) || !this.#isPositiveInteger(body.newRow) ||
                    body.newAisleID.length !== 4 ||
                    body.newRow.length !== 4 || body.newCol.length !== 4 ||
                    body.newMaxWeight === undefined || !this.#isPositiveInteger(body.newMaxWeight) ||
                    body.newMaxVolume === undefined || !this.#isPositiveInteger(body.newMaxVolume) ||
                    body.newOccupiedWeight === undefined || !this.#isPositiveInteger(body.newOccupiedWeight) ||
                    body.newOccupiedVolume === undefined || !this.#isPositiveInteger(body.newOccupiedVolume) ||
                    id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Invalid request body" });
                } else {
                    console.log(list_positions.map(pos => pos.positionID).includes(id))
                    if (list_positions.map(pos => pos.positionID).includes(id)) {
                        await this.EZWH.modifyPosition(body, id)
                        return res.status(200).json("OK");
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }

                }

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        })

        this.app.put('/api/position/:positionID/changeID', async (req, res) => {
            try {
                const body = req.body;
                const id = req.params.positionID;
                if (Object.keys(body).length === 0) {
                    return res.status(422).json({ error: "Empty body request" });
                }
                const list_positions = await this.EZWH.getAll_Positions();
                if (body.newPositionID === undefined || !this.#isPositiveInteger(body.newPositionID) || body.newPositionID.length !== 12 ||
                    id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Invalid request body" });
                } else {

                    if (list_positions.map(pos => JSON.stringify(pos.positionID)).includes(JSON.stringify(id))) {
                        await this.EZWH.modifyPosition(body, id)
                        return res.status(200).json("OK");
                    } else {
                        return res.status(404).json({ error: "Not Found" });
                    }

                }

            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        })

        this.app.delete('/api/position/:positionID', async (req, res) => {
            try {
                const id = req.params.positionID;
                if (id === undefined || !this.#isPositiveInteger(id)) {
                    return res.status(422).json({ error: "Unprocessable Entity" });
                }
                await this.EZWH.deletePosition(id);


                return res.status(204).json("OK");


            } catch (err) {
                console.log(err)
                return res.status(503).json({ error: "Service Unavailable" });
            }
        });
    }
}

module.exports = POSITION_API;