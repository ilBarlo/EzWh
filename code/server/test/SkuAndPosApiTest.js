const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);
let sku_id = 0;
let pos_id = 0;



describe('test sku and position apis', async () => {
    beforeEach(async () => {
        let res = await agent.get('/api/skus');
        console.log("get init:", res.text)

        if (res.body.length > 0) {
            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }

        res = await agent.get('/api/positions');
        if (res.body.length > 0) {
            for (let pos of res.body) {
                await agent.delete('/api/position/' + pos.positionID);
            }
        }
        const bodySku = {
            "description": "dscrpt",
            "weight": 4,
            "volume": 4,
            "notes": "note",
            "price": 4,
            "availableQuantity": 4
        }
        const bodyPos = {
            "positionID": "800234543412",
            "aisleID": "8002",
            "row": "3454",
            "col": "3412",
            "maxWeight": 1000,
            "maxVolume": 1000
        }
        res = await agent.post('/api/sku').send(bodySku);
        console.log(res.status)
        await agent.post('/api/position').send(bodyPos);
        res = await agent.get('/api/skus');
        sku_id = res.body[0].id;
        pos_id = "800234543412"

    });

    const body1 = {
        "newDescription": "a new sku",
        "newWeight": 12,
        "newVolume": 5,
        "newNotes": "first SKU",
        "newPrice": 10.99,
        "newAvailableQuantity": 3
    }
    const body2 = {
        "newDescription": "a new sku",
        "newNotes": "first SKU",
        "newPrice": 10.99,
        "newAvailableQuantity": 2
    }
    const body3 = {
        "newDescription": "a new sku",
        "newWeight": "ciao",
        "newVolume": 3,
        "newNotes": "first SKU",
        "newPrice": 10.99,
        "newAvailableQuantity": 5
    }
    const body4 = {
        "newDescription": "a new sku",
        "newWeight": 1500,
        "newVolume": 1500,
        "newNotes": "first SKU",
        "newPrice": 10.99,
        "newAvailableQuantity": 150
    }
    const bodyPosExisting = {

        "position": "800234543412"

    }
    const bodyPosNotExisting = {

        "position": "800235543412"

    }
    const bodyPos1 = {
        "positionID": "800234541234",
        "aisleID": "8002",
        "row": "3454",
        "col": "1234",
        "maxWeight": 1000,
        "maxVolume": 1000
    }
    const bodyPos2 = {
        "newAisleID": "8002",
        "newRow": "3454",
        "newCol": "4321",
        "newMaxWeight": 1000,
        "newMaxVolume": 1000,
        "newOccupiedWeight": 10,
        "newOccupiedVolume": 10
    }
    const bodyPosWrong = {
        "positionID": "54",
        "aisleID": 3,
        "row": "3454",
        "col": "4321",
        "maxWeight": 1000,
        "maxVolume": 1000
    }
    after(async () => {
        let res = await agent.get('/api/skus');
        if (res.body.length > 0) {
            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }

        res = await agent.get('/api/positions');
        if (res.body.length > 0) {
            for (let pos of res.body) {
                await agent.delete('/api/position/' + pos.positionID);
            }
        }
    })

    getAllskusTest();
    deleteskuTest(1);
    deleteskuTest(0);
    createskuTest(expectedStatus = 201, dscrpt = "dscrpt", w = 10, v = 10, note = "note", qty = 5, price = 10);
    createskuTest(expectedStatus = 422, dscrpt = "dscrpt", w = 10, v = "ciao", note = "note", qty = 5, price = 10);
    modifyskuTest1(200, body1);
    modifyskuTest1(200, body2);
    modifyskuTest1(422, body3);
    modifyskuTest1(404, body1);
    modifyskuTest2(bodyPosExisting, body1, 200);
    modifyskuTest2(bodyPosExisting, body4, 422);
    modifyskuTest2(bodyPosNotExisting, body1, 404);

    getAllpositionsTest();
    deletePositionTest(bodyPosExisting);
    deletePositionTest(bodyPosNotExisting);
    createAndModifyPositionTest(201, bodyPos1, 200, bodyPos1.positionID, bodyPos2, 200, bodyPos2.newAisleID + bodyPos2.newRow + bodyPos2.newCol, "800012340008");
    createAndModifyPositionTest(422, bodyPosWrong);
    createAndModifyPositionTest(201, bodyPos1, 422, bodyPos1.positionID, bodyPosWrong)
    createAndModifyPositionTest(201, bodyPos1, 404, bodyPosWrong.positionID, bodyPos2)
    createAndModifyPositionTest(201, bodyPos1, 200, bodyPos1.positionID, bodyPos2, 422, bodyPos2.newAisleID + bodyPos2.newRow + bodyPos2.newCol, "8ap8")
    createAndModifyPositionTest(201, bodyPos1, 200, bodyPos1.positionID, bodyPos2, 422, bodyPosWrong.positionID, "100080009000")
    createAndModifyPositionTest(201, bodyPos1, 200, bodyPos1.positionID, bodyPos2, 404, bodyPos1.positionID, "100080009000")




})

function getAllskusTest() {
    it('insert x skus and get them', (done) => {
        agent.get('/api/skus')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    const id = res.body[0].id;
                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].id.should.equal(id + i);
                        res.body[i].description.should.equal("dscrpt");
                        res.body[i].weight.should.equal(4);
                        res.body[i].volume.should.equal(4);
                        res.body[i].notes.should.equal("note");
                        res.body[i].availableQuantity.should.equal(4);
                        res.body[i].price.should.equal(4);
                        res.body[i].testDescriptors.length.should.equal(0);
                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function createskuTest(expectedStatus, dscrpt, w, v, note, qty, price) {
    it('create sku', (done) => {
        const body = {
            "description": dscrpt,
            "weight": w,
            "volume": v,
            "notes": note,
            "price": price,
            "availableQuantity": qty
        };

        agent.post('/api/sku').send(body).then((res) => {
            res.should.have.status(expectedStatus);
            agent.get('/api/skus').then((res1) => {
                if (res1.body.length > 1) {
                    const id = sku_id + 1;
                    res1.body[1].id.should.equal(id);
                    res1.body[1].description.should.equal(dscrpt);
                    res1.body[1].weight.should.equal(w);
                    res1.body[1].volume.should.equal(v);
                    res1.body[1].notes.should.equal(note);
                    res1.body[1].availableQuantity.should.equal(qty);
                    res1.body[1].price.should.equal(price);
                    res1.body[1].testDescriptors.length.should.equal(0);
                    done();
                } else {
                    res1.body.length.should.equal(1);
                    done();
                }
            }).catch((err) => done(err));
        }).catch((err) => done(err));

    });
}

function deleteskuTest(correctId) {
    it('delete: valid or invalid skuid ', (done) => {


        if (correctId) {
            const id = sku_id;
            agent.delete('/api/sku/' + id).then((res) => {
                res.should.have.status(204);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            const id = "invalid"
            agent.delete('/api/sku/' + id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }

    })
}

function modifyskuTest1(expectedStatus, body) {
    it('modify existing sku without position', (done) => {
        agent.get('/api/skus/' + sku_id).then((old_sku) => {
            if (expectedStatus !== 404) {
                agent.put('/api/sku/' + sku_id).send(body).then((res) => {
                    if (expectedStatus === 200) {
                        res.should.have.status(200);
                        agent.get('/api/skus/' + sku_id).then((res1) => {
                            res1.body.description.should.equal(body.newDescription || old_sku.body.description);
                            res1.body.weight.should.equal(body.newWeight || old_sku.body.weight);
                            res1.body.volume.should.equal(body.newVolume || old_sku.body.volume);
                            res1.body.notes.should.equal(body.newNotes || old_sku.body.notes);
                            res1.body.availableQuantity.should.equal(body.newAvailableQuantity || old_sku.body.availableQuantity);
                            res1.body.price.should.equal(body.newPrice || old_sku.body.price);
                            res1.body.testDescriptors.length.should.equal(0);
                            done();
                        }).catch((err) => { done(err) });
                    } else if (expectedStatus === 422) {
                        res.should.have.status(422);
                        agent.get('/api/skus/' + sku_id).then((res1) => {
                            res1.body.description.should.equal(old_sku.body.description);
                            res1.body.weight.should.equal(old_sku.body.weight);
                            res1.body.volume.should.equal(old_sku.body.volume);
                            res1.body.notes.should.equal(old_sku.body.notes);
                            res1.body.availableQuantity.should.equal(old_sku.body.availableQuantity);
                            res1.body.price.should.equal(old_sku.body.price);
                            res1.body.testDescriptors.length.should.equal(0);
                            done();
                        }).catch((err) => { done(err) });
                    }
                }).catch((err) => { done(err) });
            } else {
                agent.put('/api/sku/' + -3).send(body).then((res) => {
                    res.should.have.status(404);
                    done();
                }).catch((err) => { done(err) });
            }
        }).catch((err) => { done(err) });
    })
}
function modifyskuTest2(bodyPos, body, expectedStatus) {
    it('modify existing sku with position ', (done) => {



        //adding position to sku
        agent.put('/api/sku/' + sku_id + '/position').send(bodyPos).then((res) => {
            if (bodyPos.position === pos_id) {
                res.should.have.status(200);
                //getting sku
                agent.get('/api/skus/' + sku_id).then((old_sku) => {
                    //modifying sku
                    agent.put('/api/sku/' + sku_id).send(body).then((res2) => {
                        if (expectedStatus === 200) {
                            res2.should.have.status(200);
                            //getting modified sku
                            agent.get('/api/skus/' + sku_id).then((res1) => {
                                res1.body.description.should.equal(body.newDescription || old_sku.body.description);
                                res1.body.weight.should.equal(body.newWeight || old_sku.body.weight);
                                res1.body.volume.should.equal(body.newVolume || old_sku.body.volume);
                                res1.body.notes.should.equal(body.newNotes || old_sku.body.notes);
                                res1.body.availableQuantity.should.equal(body.newAvailableQuantity || old_sku.body.availableQuantity);
                                res1.body.price.should.equal(body.newPrice || old_sku.body.price);
                                res1.body.testDescriptors.length.should.equal(0);
                                done();
                            }).catch((err) => { done(err) });
                        } else if (expectedStatus === 422) {
                            res2.should.have.status(422);
                            //getting non modified sku
                            agent.get('/api/skus/' + sku_id).then((res1) => {
                                res1.body.description.should.equal(old_sku.body.description);
                                res1.body.weight.should.equal(old_sku.body.weight);
                                res1.body.volume.should.equal(old_sku.body.volume);
                                res1.body.notes.should.equal(old_sku.body.notes);
                                res1.body.availableQuantity.should.equal(old_sku.body.availableQuantity);
                                res1.body.price.should.equal(old_sku.body.price);
                                res1.body.testDescriptors.length.should.equal(0);
                                done();
                            }).catch((err) => { done(err) });
                        } else {
                            done();
                        }
                    }).catch((err) => { done(err) });
                }).catch((err) => { done(err) });
            } else {
                //position not existing
                res.should.have.status(404);
                done();
            }
        }).catch((err) => { done(err) });

    });
}

function getAllpositionsTest() {
    it('get all positions', (done) => {
        agent.get('/api/positions').then((res) => {
            res.should.have.status(200);
            res.body.length.should.equal(1);
            res.body[0].positionID.should.equal("800234543412");
            res.body[0].aisleID.should.equal("8002");
            res.body[0].row.should.equal("3454");
            res.body[0].col.should.equal("3412");
            res.body[0].maxWeight.should.equal(1000);
            res.body[0].maxVolume.should.equal(1000);
            res.body[0].occupiedWeight.should.equal(0);
            res.body[0].occupiedVolume.should.equal(0);
            done();
        }).catch((err) => done(err))
    })
}
function deletePositionTest(pos) {
    it('delete position', (done) => {
        agent.delete('/api/position/' + pos.position).then((res) => {
            if (pos.position === pos_id) {
                res.should.have.status(204);
                agent.get('/api/positions').then((res1) => {
                    res1.body.length.should.equal(0);
                    done();
                }).catch((err) => done(err));
            } else {
                res.should.have.status(422);
                done();
            }
        }).catch((err) => done(err));
    });
}
function createAndModifyPositionTest(expectedStatusPost, bodypos1, expectedStatusPut, idPut, bodypos2, expectedStatusChangeID, idChangeID, newPositionID) {
    it('create and modify position', (done) => {
        agent.post('/api/position').send(bodypos1).then((res) => {
            if (expectedStatusPost === 201) {
                res.should.have.status(201);
                agent.get('/api/positions').then((res1) => {
                    res1.body.length.should.equal(2);
                    res1.body[1].positionID.should.equal(bodypos1.positionID);
                    res1.body[1].aisleID.should.equal(bodypos1.aisleID);
                    res1.body[1].row.should.equal(bodypos1.row);
                    res1.body[1].col.should.equal(bodypos1.col);
                    res1.body[1].maxWeight.should.equal(bodypos1.maxWeight);
                    res1.body[1].maxVolume.should.equal(bodypos1.maxVolume);
                    res1.body[1].occupiedWeight.should.equal(0);
                    res1.body[1].occupiedVolume.should.equal(0);

                    agent.put('/api/position/' + idPut).send(bodypos2).then((res2) => {
                        if (idPut === bodypos1.positionID) {
                            if (expectedStatusPut === 200) {
                                res2.should.have.status(200);
                                agent.get('/api/positions').then((res3) => {
                                    res3.body.length.should.equal(2);
                                    res3.body[1].positionID.should.equal(bodypos2.newAisleID + bodypos2.newRow + bodypos2.newCol);
                                    res3.body[1].aisleID.should.equal(bodypos2.newAisleID);
                                    res3.body[1].row.should.equal(bodypos2.newRow);
                                    res3.body[1].col.should.equal(bodypos2.newCol);
                                    res3.body[1].maxWeight.should.equal(bodypos2.newMaxWeight);
                                    res3.body[1].maxVolume.should.equal(bodypos2.newMaxVolume);
                                    res3.body[1].occupiedWeight.should.equal(bodypos2.newOccupiedWeight);
                                    res3.body[1].occupiedVolume.should.equal(bodypos2.newOccupiedVolume);

                                    agent.put('/api/position/' + idChangeID + '/changeID').send({ "newPositionID": newPositionID }).then((res4) => {
                                        if (idChangeID === (bodypos2.newAisleID + bodypos2.newRow + bodypos2.newCol)) {
                                            if (expectedStatusChangeID === 200) {
                                                res4.should.have.status(200);
                                                agent.get('/api/positions').then((res5) => {
                                                    res5.body[1].positionID.should.equal(newPositionID);
                                                    res5.body[1].aisleID.should.equal(newPositionID.slice(0, 4));
                                                    res5.body[1].row.should.equal(newPositionID.slice(4, 8));
                                                    res5.body[1].col.should.equal(newPositionID.slice(8, 12));
                                                    res5.body[1].maxWeight.should.equal(bodypos2.newMaxWeight);
                                                    res5.body[1].maxVolume.should.equal(bodypos2.newMaxVolume);
                                                    res5.body[1].occupiedWeight.should.equal(bodypos2.newOccupiedVolume);
                                                    res5.body[1].occupiedVolume.should.equal(bodypos2.newOccupiedWeight);
                                                    done();
                                                }).catch((err) => done(err))
                                            } else {
                                                res4.should.have.status(422);
                                                done();
                                            }
                                        } else if (isNaN(idChangeID)) {
                                            res4.should.have.status(422);
                                            done();
                                        }
                                        else {
                                            res4.should.have.status(404);
                                            done();
                                        }

                                    }).catch((err) => done(err));
                                }).catch((err) => done(err))

                            } else {
                                res2.should.have.status(422);
                                done();
                            }
                        } else {
                            res2.should.have.status(404);
                            done();
                        }

                    }).catch((err) => done(err))
                }).catch((err) => done(err))

            } else if (expectedStatusPost === 422) {
                res.should.have.status(422);
                done();
            } else {
                res.should.have.status(503);
                done();
            }

        }).catch((err) => done(err))
    })
}
