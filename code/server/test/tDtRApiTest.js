const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);

let sku_id = 0;
let td_id = 0;
let tr_id = 0;
let rfid = "12345678901234567890123456789015";
let bodyTd = {};
let bodyTr = {};
let bodySku = {};
let bodySkui = {};




describe('test td and tr apis', async () => {
    beforeEach(async () => {
        let res = await agent.get('/api/skuitems/' + rfid + '/testResults');
        if (res.body.length > 0) {

            for (let tr of res.body) {
                await agent.delete('/api/skuitems/' + rfid + '/testResult/' + tr.id);
            }
        }
        res = await agent.get('/api/testDescriptors');
        if (res.body.length > 0) {

            for (let td of res.body) {
                await agent.delete('/api/testDescriptor/' + td.id);
            }
        }

        res = await agent.get('/api/skuitems');
        if (res.body.length > 0) {

            for (let skui of res.body) {
                await agent.delete('/api/skuitems/' + skui.RFID);
            }
        }
        res = await agent.get('/api/skus');
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

        await agent.post('/api/sku').send(bodySku);
        res = await agent.get('/api/skus');
        sku_id = res.body[0].id;

        bodyTd = {
            "name": "test descriptor",
            "procedureDescription": "This test is described by...",
            "idSKU": sku_id
        }

        await agent.post('/api/testDescriptor').send(bodyTd).catch((err) => { throw err });
        res = await agent.get('/api/testDescriptors').catch((err) => { throw err });
        td_id = res.body[0].id;

        bodySkui = {
            "RFID": rfid,
            "SKUId": sku_id,
            "DateOfStock": "2021/11/29 12:30"
        }

        res = await agent.post('/api/skuitem').send(bodySkui);
        bodyTr = {
            "rfid": rfid,
            "idTestDescriptor": td_id,
            "Date": "2021/11/28",
            "Result": true
        }
        res = await agent.post('/api/skuitems/testResult').send(bodyTr);

        res = await agent.get('/api/skuitems/' + rfid + '/testResults');

        tr_id = res.body[0].id;
    });
    after(async () => {
        let res = await agent.get('/api/skuitems/' + rfid + '/testResults');
        if (res.body.length > 0) {

            for (let tr of res.body) {
                await agent.delete('/api/skuitems/' + rfid + '/testResult/' + tr.id);
            }
        }
        res = await agent.get('/api/testDescriptors');
        if (res.body.length > 0) {

            for (let td of res.body) {
                await agent.delete('/api/testDescriptor/' + td.id);
            }
        }

        res = await agent.get('/api/skuitems');
        if (res.body.length > 0) {

            for (let skui of res.body) {
                await agent.delete('/api/skuitems/' + skui.RFID);
            }
        }
        res = await agent.get('/api/skus');
        if (res.body.length > 0) {

            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }

    })



    testGetTestDescriptorsAndTestResults();
    testCreateAndDeleteTestDescriptors(201, 204);
    testCreateAndDeleteTestDescriptors(404);
    testCreateAndDeleteTestDescriptors(422);
    testCreateAndDeleteTestDescriptors(201, 422);

    testCreateAndDeleteTestResults(201, 204);
    testCreateAndDeleteTestResults(422);
    testCreateAndDeleteTestResults(404);
    testCreateAndDeleteTestResults(201, 422);

    testModifyTestDescriptor(200);
    testModifyTestDescriptor(422);
    testModifyTestDescriptor(404);

    testModifyTestResult(200);
    testModifyTestResult(404, skui);
    testModifyTestResult(404, td);
    testModifyTestResult(404, tr);
    testModifyTestResult(422);









})
function testGetTestDescriptorsAndTestResults() {
    it('get all td and get all tr', (done) => {
        agent.get('/api/testDescriptors').then((res) => {
            res.should.have.status(200);
            res.body[0].id.should.equal(td_id);
            res.body[0].name.should.equal(bodyTd.name);
            res.body[0].procedureDescription.should.equal(bodyTd.procedureDescription);
            res.body[0].idSKU.should.equal(bodyTd.idSKU);
            agent.get('/api/skuitems/' + rfid + '/testResults').then((res1) => {
                res1.should.have.status(200);
                res1.body[0].id.should.equal(tr_id);
                res1.body[0].idTestDescriptor.should.equal(bodyTr.idTestDescriptor);
                res1.body[0].Date.should.equal(bodyTr.Date);
                res1.body[0].Result.should.equal(bodyTr.Result);
                done()
            }).catch((err) => done(err));
        }).catch((err) => done(err))
    })
}

function testCreateAndDeleteTestDescriptors(expectedStatusPostTD, expectedStatusDeleteTD) {
    it('create and delete td ', (done) => {
        if (expectedStatusPostTD === 201) {
            let bodyTd1 = {
                "name": "test descriptor",
                "procedureDescription": "This test is described by...",
                "idSKU": sku_id
            }
            agent.post('/api/testDescriptor').send(bodyTd1).then((res) => {
                res.should.have.status(201);
                agent.get('/api/testDescriptors/' + (td_id + 1)).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal(td_id + 1);
                    res1.body.name.should.equal(bodyTd1.name);
                    res1.body.procedureDescription.should.equal(bodyTd1.procedureDescription);
                    res1.body.idSKU.should.equal(bodyTd1.idSKU);
                    if (expectedStatusDeleteTD === 204) {
                        agent.delete('/api/testDescriptor/' + (td_id + 1)).then((res2) => {
                            res2.should.have.status(204);
                            done();

                        }).catch((err) => done(err));
                    } else {
                        agent.delete('/api/testDescriptor/' + (td_id + 2)).then((res2) => {
                            res2.should.have.status(422);
                            done();

                        }).catch((err) => done(err));
                    }
                }).catch((err) => done(err));
            }).catch((err) => done(err));
        } else if (expectedStatusPostTD === 422) {
            let bodyTdWrong = { "procedureDescription": "desc" };
            agent.post('/api/testDescriptor').send(bodyTdWrong).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else {
            let bodyTd2 = {
                "name": "test descriptor",
                "procedureDescription": "This test is described by...",
                "idSKU": -2
            }
            agent.post('/api/testDescriptor').send(bodyTd2).then((res) => {
                res.should.have.status(404);
                done();
            }).catch((err) => done(err));
        }
    });
}

function testCreateAndDeleteTestResults(expectedStatusPostTR, expectedStatusDeleteTR) {
    it('create and delete tr', (done) => {
        if (expectedStatusPostTR === 201) {
            let bodyTr1 = {
                "rfid": rfid,
                "idTestDescriptor": td_id,
                "Date": "2021/11/28",
                "Result": true
            }
            agent.post('/api/skuitems/testResult').send(bodyTr1).then((res) => {
                res.should.have.status(201);
                agent.get('/api/skuitems/' + rfid + '/testResults/' + (tr_id + 1)).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal(tr_id + 1);
                    res1.body.Date.should.equal(bodyTr1.Date);
                    res1.body.Result.should.equal(bodyTr1.Result);

                    res1.body.idTestDescriptor.should.equal(bodyTr1.idTestDescriptor);


                    if (expectedStatusDeleteTR === 204) {
                        agent.delete('/api/skuitems/' + rfid + '/testResult/' + (tr_id + 1)).then((res2) => {
                            res2.should.have.status(204);
                            done();

                        }).catch((err) => done(err));
                    } else {
                        agent.delete('/api/skuitems/' + rfid + '/testResult/' + (tr_id + 2)).then((res2) => {
                            res2.should.have.status(422);
                            done();

                        }).catch((err) => done(err));
                    }
                }).catch((err) => done(err));
            }).catch((err) => done(err));
        } else if (expectedStatusPostTR === 422) {
            let bodyTrWrong = {
                "rfid": rfid,
                "idTestDescriptor": "td_id",
                "Date": "tt",
                "Result": true
            }

            agent.post('/api/skuitems/testResult').send(bodyTrWrong).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        } else {
            let bodyTr2 = {
                "rfid": "ab",
                "idTestDescriptor": td_id,
                "Date": "2021/11/28",
                "Result": true
            }
            agent.post('/api/skuitems/testResult').send(bodyTr2).then((res) => {
                res.should.have.status(404);
                done();
            }).catch((err) => done(err));
        }
    });
}

function testModifyTestDescriptor(expectedStatus) {
    it('test put td', (done) => {
        if (expectedStatus === 200) {
            let bodyNewTd = {
                "newName": "test descriptor",
                "newProcedureDescription": "This test is described by...",
                "newIdSKU": sku_id
            }
            agent.put('/api/testDescriptor/' + td_id).send(bodyNewTd).then((res) => {
                res.should.have.status(200);
                agent.get('/api/testDescriptors/' + td_id).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal(td_id);
                    res1.body.name.should.equal(bodyNewTd.newName);
                    res1.body.procedureDescription.should.equal(bodyNewTd.newProcedureDescription);
                    res1.body.idSKU.should.equal(bodyNewTd.newIdSKU);
                    done();
                }).catch((err) => done(err));

            }).catch((err) => done(err));;
        } else if (expectedStatus === 404) {
            let bodyNewTd = {
                "newName": "test descriptor",
                "newProcedureDescription": "This test is described by...",
                "newIdSKU": sku_id
            }
            agent.put('/api/testDescriptor/' + (td_id + 6)).send(bodyNewTd).then((res) => {
                res.should.have.status(404);
                done();
            }).catch((err) => done(err));
        } else {
            let bodyWrongTd = {
                "name": "test descriptor",
                "newProcedureDescription": "This test is described by...",
                "newIdSKU": "sku_id"
            }
            agent.put('/api/testDescriptor/' + (td_id)).send(bodyWrongTd).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        }
    });
}

function testModifyTestResult(expectedStatus, testNotFound) {
    it('test put tr', (done) => {
        if (expectedStatus === 200) {
            let bodyNewTr = {
                "newIdTestDescriptor": td_id,
                "newDate": "2021/11/28",
                "newResult": true
            }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + tr_id).send(bodyNewTr).then((res) => {
                res.should.have.status(200);
                agent.get('/api/skuitems/' + rfid + '/testResults/' + tr_id).then((res1) => {
                    res1.should.have.status(200);
                    res1.body.id.should.equal(tr_id);
                    res1.body.idTestDescriptor.should.equal(bodyNewTr.newIdTestDescriptor);
                    res1.body.Date.should.equal(bodyNewTr.newDate);
                    res1.body.Result.should.equal(bodyNewTr.newResult);

                    done();
                }).catch((err) => done(err));

            }).catch((err) => done(err));
        } else if (expectedStatus === 404 && testNotFound === "td") {
            let bodyNewTr = {
                "newIdTestDescriptor": td_id + 1,
                "newDate": "2021/11/28",
                "newResult": true
            }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + tr_id).send(bodyNewTr).then((res) => {
                res.should.have.status(404);
            }).catch((err) => done(err));
        } else if (expectedStatus === 404 && testNotFound === "skui") {
            let bodyNewTr = {
                "newIdTestDescriptor": td_id,
                "newDate": "2021/11/28",
                "newResult": true
            }
            agent.put('/api/skuitems/' + "rfid" + '/testResult/' + tr_id).send(bodyNewTr).then((res) => {
                res.should.have.status(404);
            }).catch((err) => done(err));
        } else if (expectedStatus === 404 && testNotFound === "tr") {
            let bodyNewTr = {
                "newIdTestDescriptor": td_id,
                "newDate": "2021/11/28",
                "newResult": true
            }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + (tr_id + 1)).send(bodyNewTr).then((res) => {
                res.should.have.status(404);
            }).catch((err) => done(err));
        } else {
            let bodyWrongTr = {
                "newIdTestDescriptor": td_id,
                "newDate": "2021/11/28",
            }
            agent.put('/api/skuitems/' + rfid + '/testResult/' + tr_id).send(bodyWrongTr).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => done(err));
        }
    });
}