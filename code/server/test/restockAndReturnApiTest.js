const chai = require('chai');
const chaiHttp = require('chai-http');
const { response } = require('express');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);

let sku_id1 = 0;
let sku_id2 = 0;


let rfid1 = "12345678901234567890123456789015";
let rfid2 = "12345678901234567890123456789016";
let rfid3 = "12345678901234567890123456789017";
let rfid4 = "12345678901234567890123456789018";
let rfid5 = "12345678901234567890123456789019";
let rfid6 = "12345678901234567890123456789020";

let rs_id1 = 0;
let rs_id2 = 0;
let rs_id3 = 0;
let rt_id = 0;


let bodySku = {};
let bodyRS = {};
let bodyRT = {};
let bodyNewState = {};
let bodySKUI_RS1 = {};
let bodySKUI_RS2 = {};


describe('test restockorder returnorder apis', async () => {
    beforeEach(async () => {
        let res = await agent.get('/api/returnOrders').catch((err) => done(err));;
        if (res.body.length > 0) {
            for (let rt of res.body) {
                await agent.delete('/api/returnOrder/' + rt.id).catch((err) => done(err));
            }
        }
        res = await agent.get('/api/restockOrders').catch((err) => done(err));

        if (res.body.length > 0) {
            for (let rs of res.body) {
                await agent.delete('/api/restockOrder/' + rs.id).catch((err) => done(err));

            }
        }
        res = await agent.get('/api/skuitems').catch((err) => done(err));
        if (res.body.length > 0) {
            for (let skui of res.body) {
                await agent.delete('/api/skuitems/' + skui.RFID);
            }
        }
        res = await agent.get('/api/skus').catch((err) => done(err));
        if (res.body.length > 0) {
            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }


        bodySku = {
            "description": "dscrpt",
            "weight": 4,
            "volume": 4,
            "notes": "note",
            "price": 4,
            "availableQuantity": 4
        }

        res = await agent.post('/api/sku').send(bodySku).catch((err) => done(err));
        res = await agent.get('/api/skus').catch((err) => done(err));
        sku_id1 = res.body[0].id;
        await agent.post('/api/sku').send(bodySku).catch((err) => done(err));
        res = await agent.get('/api/skus').catch((err) => done(err));
        sku_id2 = res.body[1].id;


        bodyRS = {
            "issueDate": "2021/11/29 09:33",
            "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "qty": 30 },
            { "SKUId": sku_id2, "description": "another product", "price": 11.99, "qty": 20 }],
            "supplierId": 1
        }

        res = await agent.post('/api/restockOrder').send(bodyRS).catch((err) => done(err));
        res = await agent.post('/api/restockOrder').send(bodyRS).catch((err) => done(err));
        res = await agent.post('/api/restockOrder').send(bodyRS).catch((err) => done(err));

        res = await agent.get('/api/restockOrders');
        rs_id1 = res.body[0].id;
        rs_id2 = res.body[1].id;
        rs_id3 = res.body[2].id;


        bodySKUI_RS1 = {

            "skuItems": [{ "SKUId": sku_id1, "rfid": rfid1 }, { "SKUId": sku_id2, "rfid": rfid2 }]
        }
        bodySKUI_RS2 = {

            "skuItems": [{ "SKUId": sku_id1, "rfid": rfid3 }, { "SKUId": sku_id2, "rfid": rfid4 }]
        }
        bodyNewState = {
            "newState": "DELIVERED"
        }
        res = await agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).catch((err) => done(err));

        res = await agent.put('/api/restockOrder/' + rs_id1 + '/skuItems').send(bodySKUI_RS1).catch((err) => done(err));

        res = await agent.put('/api/restockOrder/' + rs_id2).send(bodyNewState).catch((err) => done(err));

        res = await agent.put('/api/restockOrder/' + rs_id2 + '/skuItems').send(bodySKUI_RS2).catch((err) => done(err));

        bodyRT = {
            "returnDate": "2021/11/29 09:33",
            "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "RFID": rfid1 },
            { "SKUId": sku_id2, "description": "another product", "price": 11.99, "RFID": rfid2 }],
            "restockOrderId": rs_id1
        }
        res = await agent.post('/api/returnOrder').send(bodyRT).catch((err) => done(err));

        res = await agent.get('/api/returnOrders').catch((err) => done(err));
        rt_id = res.body[0].id;
    });
    after(async () => {
        let res = await agent.get('/api/returnOrders').catch((err) => done(err));;
        if (res.body.length > 0) {
            for (let rt of res.body) {
                await agent.delete('/api/returnOrder/' + rt.id).catch((err) => done(err));
            }
        }
        res = await agent.get('/api/restockOrders').catch((err) => done(err));

        if (res.body.length > 0) {
            for (let rs of res.body) {
                await agent.delete('/api/restockOrder/' + rs.id).catch((err) => done(err));

            }
        }
        res = await agent.get('/api/skuitems').catch((err) => done(err));
        if (res.body.length > 0) {
            for (let skui of res.body) {
                await agent.delete('/api/skuitems/' + skui.RFID);
            }
        }
        res = await agent.get('/api/skus').catch((err) => done(err));
        if (res.body.length > 0) {
            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }
    })

    testCreateAndDeleteRS(201, true, true, true, 204);
    testCreateAndDeleteRS(201, true, true, true, 422);
    testCreateAndDeleteRS(422, false, true, true);
    testCreateAndDeleteRS(422, true, false, true);
    testCreateAndDeleteRS(422, true, true, false);

    testCreateAndDeleteRT(201, true, true, 204);
    testCreateAndDeleteRT(404, true, true, 204);
    testCreateAndDeleteRT(422, false, true, 204);
    testCreateAndDeleteRT(422, true, false, 204);
    testCreateAndDeleteRT(201, true, true, 422);


    testGettersRS();

    testChangeStateRS(200);
    testChangeStateRS(422);
    testChangeStateRS(404);



    testTransportNoteRS(200, true, true);
    testTransportNoteRS(422, true, true);
    testTransportNoteRS(422, true, false);
    testTransportNoteRS(422, false, true);
    testTransportNoteRS(404, true, true);



    testSkuiRS(200, true, true);
    testSkuiRS(422, true, false);
    testSkuiRS(422, false, true);
    testSkuiRS(404);

});

function testCreateAndDeleteRS(expectedStatusPost, correctDate, correctProductsSKU, correctSupp, expectedStatusDelete) {
    it('create and delete rs', (done) => {
        if (expectedStatusPost === 201) {
            let bodyRS1 = {
                "issueDate": "2021/11/29 09:33",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "qty": 30 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "qty": 20 }],
                "supplierId": 2
            }
            agent.post('/api/restockOrder').send(bodyRS1).then((res) => {
                res.should.have.status(201);
                agent.get('/api/restockOrders/' + (rs_id3 + 1)).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal((rs_id3 + 1));
                    res1.body.issueDate.should.equal(bodyRS1.issueDate);
                    res1.body.products[0].SKUId.should.equal(bodyRS1.products[0].SKUId);
                    res1.body.products[0].qty.should.equal(bodyRS1.products[0].qty);
                    res1.body.products[1].SKUId.should.equal(bodyRS1.products[1].SKUId);
                    res1.body.products[1].qty.should.equal(bodyRS1.products[1].qty);
                    res1.body.supplierId.should.equal(bodyRS1.supplierId);
                    res1.body.state.should.equal("ISSUED");
                    if (expectedStatusDelete === 204) {
                        agent.delete('/api/restockOrder/' + (rs_id3 + 1)).then((res2) => {
                            res2.should.have.status(204);
                            done();
                        }).catch((err) => done(err));
                    } else {
                        agent.delete('/api/restockOrder/' + (-3)).then((res2) => {
                            res2.should.have.status(422);
                            done();
                        }).catch((err) => done(err));

                    }
                }).catch((err) => done(err));
            }).catch((err) => done(err));

        } else if (expectedStatusPost === 422 && !correctDate && correctProductsSKU && correctSupp) {
            let bodyRSwD = {
                "issueDate": "2021/10",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "qty": 30 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "qty": 20 }],
                "supplierId": 2
            }
            agent.post('/api/restockOrder').send(bodyRSwD).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else if (expectedStatusPost === 422 && !correctProductsSKU && correctSupp) {
            let bodyRSwSku = {
                "issueDate": "2021/11/29 09:33",
                "products": [{ "SKUId": -2, "description": "a product", "price": 10.99, "qty": 30 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "qty": 20 }],
                "supplierId": 2
            }
            agent.post('/api/restockOrder').send(bodyRSwSku).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));

        } else if (expectedStatusPost === 422 && correctDate && correctProductsSKU && !correctSupp) {
            let bodyRSwSupp = {
                "issueDate": "2021/11/29 09:33",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "qty": 30 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "qty": 20 }],
                "supplierId": "c"
            }
            agent.post('/api/restockOrder').send(bodyRSwSupp).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        }
    })
}
function testCreateAndDeleteRT(expectedStatusPost, correctDate, correctProductsSKU, expectedStatusDelete) {
    it('create and delete rt', (done) => {
        if (expectedStatusPost === 201) {
            let bodyRT1 = {
                "returnDate": "2021/11/29 09:33",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "RFID": rfid3 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "RFID": rfid4 }],
                "restockOrderId": rs_id2
            }
            agent.post('/api/returnOrder').send(bodyRT1).then((res) => {
                res.should.have.status(201);
                agent.get('/api/returnOrders/' + (rt_id + 1)).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal((rt_id + 1));
                    res1.body.returnDate.should.equal(bodyRT1.returnDate);
                    res1.body.products[0].SKUId.should.equal(bodyRT1.products[0].SKUId);
                    res1.body.products[0].RFID.should.equal(bodyRT1.products[0].RFID);
                    res1.body.products[1].SKUId.should.equal(bodyRT1.products[1].SKUId);
                    res1.body.products[1].RFID.should.equal(bodyRT1.products[1].RFID);
                    res1.body.restockOrderId.should.equal(bodyRT1.restockOrderId);
                    if (expectedStatusDelete === 204) {
                        agent.delete('/api/returnOrder/' + (rt_id + 1)).then((res2) => {
                            res2.should.have.status(204);
                            done();
                        }).catch((err) => done(err));
                    } else {
                        agent.delete('/api/returnOrder/' + (-3)).then((res2) => {
                            res2.should.have.status(422);
                            done();
                        }).catch((err) => done(err));

                    }
                }).catch((err) => done(err));
            }).catch((err) => done(err));

        } else if (expectedStatusPost === 404) {
            let bodyRTm = {
                "returnDate": "2021/11/29 09:33",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "RFID": rfid1 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "RFID": rfid2 }],
                "restockOrderId": rs_id2 + 7
            }
            agent.post('/api/returnOrder').send(bodyRTm).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else if (expectedStatusPost === 422 && !correctProductsSKU && correctDate) {
            let bodyRTwSku = {
                "returnDate": "2021/11/29 09:33",
                "products": [{ "SKUId": -2, "description": "a product", "price": 10.99, "RFID": rfid1 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "RFID": rfid2 }],
                "restockOrderId": rs_id2
            }
            agent.post('/api/returnOrder').send(bodyRTwSku).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));

        } else if (expectedStatusPost === 422 && !correctDate && correctProductsSKU) {
            let bodyRTwD = {
                "returnDate": "2021/11/29 09:33",
                "products": [{ "SKUId": sku_id1, "description": "a product", "price": 10.99, "RFID": rfid1 },
                { "SKUId": sku_id2, "description": "another product", "price": 11.99, "RFID": rfid2 }],
                "restockOrderId": rs_id2
            }
            agent.post('/api/returnOrder').send(bodyRTwD).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        }
    })
}
function testGettersRS() {
    it('getters rs ', (done) => {
        agent.get('/api/restockOrders').then((res) => {
            res.should.have.status(200);
            res.body.length.should.equal(3);
            res.body[0].id.should.equal((rs_id1));
            res.body[0].issueDate.should.equal(bodyRS.issueDate);
            res.body[0].products[0].SKUId.should.equal(bodyRS.products[0].SKUId);
            res.body[0].products[0].qty.should.equal(bodyRS.products[0].qty);
            res.body[0].products[1].SKUId.should.equal(bodyRS.products[1].SKUId);
            res.body[0].products[1].qty.should.equal(bodyRS.products[1].qty);
            res.body[0].skuItems[0].SKUId.should.equal(bodySKUI_RS1.skuItems[0].SKUId);
            res.body[0].skuItems[0].rfid.should.equal(bodySKUI_RS1.skuItems[0].rfid);
            res.body[0].skuItems[1].SKUId.should.equal(bodySKUI_RS1.skuItems[1].SKUId);
            res.body[0].skuItems[1].rfid.should.equal(bodySKUI_RS1.skuItems[1].rfid);
            res.body[0].supplierId.should.equal(bodyRS.supplierId);
            res.body[0].state.should.equal("DELIVERED");
            res.body[1].id.should.equal((rs_id2));
            res.body[1].issueDate.should.equal(bodyRS.issueDate);
            res.body[1].products[0].SKUId.should.equal(bodyRS.products[0].SKUId);
            res.body[1].products[0].qty.should.equal(bodyRS.products[0].qty);
            res.body[1].products[1].SKUId.should.equal(bodyRS.products[1].SKUId);
            res.body[1].products[1].qty.should.equal(bodyRS.products[1].qty);
            res.body[1].skuItems[0].SKUId.should.equal(bodySKUI_RS2.skuItems[0].SKUId);
            res.body[1].skuItems[0].rfid.should.equal(bodySKUI_RS2.skuItems[0].rfid);
            res.body[1].skuItems[1].SKUId.should.equal(bodySKUI_RS2.skuItems[1].SKUId);
            res.body[1].skuItems[1].rfid.should.equal(bodySKUI_RS2.skuItems[1].rfid);
            res.body[1].supplierId.should.equal(bodyRS.supplierId);
            res.body[1].state.should.equal("DELIVERED");

            agent.get('/api/restockOrders/' + rs_id1 + '/returnItems').then((res1) => {
                res1.should.have.status(200);
                res1.body.length.should.equal(2);
                res1.body[0].rfid.should.equal(bodySKUI_RS1.skuItems[0].rfid);
                res1.body[0].SKUId.should.equal(bodySKUI_RS1.skuItems[0].SKUId);
                res1.body[1].rfid.should.equal(bodySKUI_RS1.skuItems[1].rfid);
                res1.body[1].SKUId.should.equal(bodySKUI_RS1.skuItems[1].SKUId);

                agent.get('/api/restockOrdersIssued').then((res3) => {
                    res3.should.have.status(200);
                    res3.body.length.should.equal(1);
                    res3.body[0].id.should.equal((rs_id3));
                    res3.body[0].issueDate.should.equal(bodyRS.issueDate);
                    res3.body[0].products[0].SKUId.should.equal(bodyRS.products[0].SKUId);
                    res3.body[0].products[0].qty.should.equal(bodyRS.products[0].qty);
                    res3.body[0].products[1].SKUId.should.equal(bodyRS.products[1].SKUId);
                    res3.body[0].products[1].qty.should.equal(bodyRS.products[1].qty);
                    res3.body[0].supplierId.should.equal(bodyRS.supplierId);
                    res3.body[0].state.should.equal("ISSUED");
                    done();
                }).catch((err) => done(err));
            }).catch((err) => done(err))
        }).catch((err) => done(err))
    })
}

function testChangeStateRS(expectedStatusPut) {
    it('change state', (done) => {
        if (expectedStatusPut === 200) {
            bodyNewState = {
                "newState": "COMPLETED"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res2) => {
                res2.should.have.status(200);
                agent.get('/api/restockOrders/' + rs_id1).then((res) => {
                    res.should.have.status(200);
                    res.body.id.should.equal((rs_id1));
                    res.body.state.should.equal("COMPLETED");
                    done();
                }).catch((err) => done(err));
            }).catch((err) => done(err));
        } else if (expectedStatusPut === 422) {
            bodyNewState = {
                "newState": "NOT"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res2) => {
                res2.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else {
            bodyNewState = {
                "newState": "COMPLETED"
            }
            agent.put('/api/restockOrder/' + (-3)).send(bodyNewState).then((res2) => {
                res2.should.have.status(404);
                done();
            }).catch((err) => done(err));
        }
    })
}
function testSkuiRS(expectedStatusPut, correctOrderState, correctList) {
    it('add skuitem to rs', (done) => {
        if (expectedStatusPut === 200) {
            let bodyNewSKUI_RS = {
                "skuItems": [{ "SKUId": sku_id1, "rfid": rfid5 }, { "SKUId": sku_id2, "rfid": rfid6 }]
            }
            agent.put('/api/restockOrder/' + rs_id1 + '/skuItems').send(bodyNewSKUI_RS).then((res2) => {
                res2.should.have.status(200);
                agent.get('/api/restockOrders/' + rs_id1).then((res) => {
                    res.should.have.status(200);
                    res.body.id.should.equal((rs_id1));
                    res.body.issueDate.should.equal(bodyRS.issueDate);
                    res.body.products[0].SKUId.should.equal(bodyRS.products[0].SKUId);
                    res.body.products[0].qty.should.equal(bodyRS.products[0].qty);
                    res.body.products[1].SKUId.should.equal(bodyRS.products[1].SKUId);
                    res.body.products[1].qty.should.equal(bodyRS.products[1].qty);
                    res.body.skuItems[0].SKUId.should.equal(sku_id1);
                    res.body.skuItems[0].rfid.should.equal(rfid1);
                    res.body.skuItems[2].SKUId.should.equal(sku_id2);
                    res.body.skuItems[2].rfid.should.equal(rfid2);
                    res.body.skuItems[1].SKUId.should.equal(bodyNewSKUI_RS.skuItems[0].SKUId);
                    res.body.skuItems[1].rfid.should.equal(bodyNewSKUI_RS.skuItems[0].rfid);
                    res.body.skuItems[3].SKUId.should.equal(bodyNewSKUI_RS.skuItems[1].SKUId);
                    res.body.skuItems[3].rfid.should.equal(bodyNewSKUI_RS.skuItems[1].rfid);
                    res.body.state.should.equal("DELIVERED");
                    done();
                }).catch((err) => done(err));
            }).catch((err) => done(err));
        } else if (expectedStatusPut === 422 && correctOrderState && !correctList) {
            let bodyNewSKUI_RSw = {
                "skuItems": [{ "SKUId": sku_id1, "rfid": rfid1 }, { "SKUId": sku_id2, "rfid": rfid6 }]
            }
            agent.put('/api/restockOrder/' + rs_id1 + '/skuItems').send(bodyNewSKUI_RSw).then((res2) => {
                res2.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else if (expectedStatusPut === 422 && !correctOrderState && correctList) {
            let bodyNewSKUI_RS = {
                "skuItems": [{ "SKUId": sku_id1, "rfid": rfid5 }, { "SKUId": sku_id2, "rfid": rfid6 }]
            }
            agent.put('/api/restockOrder/' + rs_id3 + '/skuItems').send(bodyNewSKUI_RS).then((res2) => {
                res2.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else {
            let bodyNewSKUI_RS = {
                "skuItems": [{ "SKUId": sku_id1, "rfid": rfid1 }, { "SKUId": sku_id2, "rfid": rfid2 }]
            }
            agent.put('/api/restockOrder/' + (-3) + '/skuItems').send(bodyNewSKUI_RS).then((res2) => {
                res2.should.have.status(404);
                done();
            }).catch((err) => done(err));
        }
    })
}

function testTransportNoteRS(expectedStatusPut, correctOrderState, correctDeliveryDate) {
    it('add transport note to rs', (done) => {
        if (expectedStatusPut === 200) {
            let bodyNewTransportNote = {
                "transportNote": { "deliveryDate": "2022/12/29" }
            }
            bodyNewState = {
                "newState": "DELIVERY"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res) => {
                res.should.have.status(200);
                agent.put('/api/restockOrder/ ' + rs_id1 + '/transportNote').send(bodyNewTransportNote).then((res2) => {
                    res2.should.have.status(200);
                    agent.get('/api/restockOrders/' + rs_id1).then((res1) => {
                        res1.should.have.status(200);
                        res1.body.id.should.equal((rs_id1));
                        res1.body.transportNote.deliveryDate.should.equal("2022/12/29");
                        res1.body.state.should.equal("DELIVERY");
                        done();
                    }).catch((err) => done(err));
                }).catch((err) => done(err));

            }).catch((err) => done(err));

        } else if (expectedStatusPut === 422 && correctOrderState && !correctDeliveryDate) {
            let bodyNewTransportNote = {
                "transportNote": { "deliveryDate": "1998/12/29" }
            }
            bodyNewState = {
                "newState": "DELIVERY"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res) => {
                res.should.have.status(200);
                agent.put('/api/restockOrder/ ' + rs_id1 + '/transportNote').send(bodyNewTransportNote).then((res2) => {
                    res2.should.have.status(422);
                    done();
                }).catch((err) => done(err));

            }).catch((err) => done(err));
        } else if (expectedStatusPut === 422 && !correctOrderState && correctDeliveryDate) {
            let bodyNewTransportNote = {
                "transportNote": { "deliveryDate": "2022/12/29" }
            }
            agent.put('/api/restockOrder/ ' + rs_id1 + '/transportNote').send(bodyNewTransportNote).then((res2) => {
                res2.should.have.status(422);
                done();
            }).catch((err) => done(err));

        } else if (expectedStatusPut === 422 && correctOrderState && correctDeliveryDate) {
            let bodyNewTransportNote = {
                "tn": { "deliveryDate": "2022/12/29" }
            }
            bodyNewState = {
                "newState": "DELIVERY"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res) => {
                res.should.have.status(200);
                agent.put('/api/restockOrder/ ' + rs_id1 + '/transportNote').send(bodyNewTransportNote).then((res2) => {
                    res2.should.have.status(422);
                    done();
                }).catch((err) => done(err));

            }).catch((err) => done(err));
        } else {
            let bodyNewTransportNote = {
                "transportNote": { "deliveryDate": "2022/12/29" }
            }
            bodyNewState = {
                "newState": "DELIVERY"
            }
            agent.put('/api/restockOrder/' + rs_id1).send(bodyNewState).then((res) => {
                res.should.have.status(200);
                agent.put('/api/restockOrder/ ' + (-3) + '/transportNote').send(bodyNewTransportNote).then((res2) => {
                    res2.should.have.status(404);
                    done();
                }).catch((err) => done(err));

            }).catch((err) => done(err));
        }
    })
}

