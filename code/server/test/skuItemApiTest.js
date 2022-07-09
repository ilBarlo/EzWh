const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);
let sku_id = 0;

describe('test sku items apis', async () => {
    beforeEach(async () => {
        const res_sku = await agent.get('/api/skus');
        sku_id = res_sku.body[0].id;

        let res = await agent.get('/api/skuitems');
        for (let sku_item of res.body) {
            const check = await agent.delete('/api/skuitems/' + sku_item.RFID);
        }

        const body = {
            "RFID": "12345678901234567890123456789014",
            "SKUId": sku_id,
            "Available": 0,
            "DateOfStock": "2021/11/29 12:30",
        }

        await agent.post('/api/skuitem').send(body);
        res = await agent.get('/api/skusitems');

    });
    after(async () => {
        let res = await agent.get('/api/skuitems');
        for (let sku_item of res.body) {
            const check = await agent.delete('/api/skuitems/' + sku_item.RFID);
        }
    })

    getAllskuItemsTest();
    getskuItemTest("12345678901234567890123456789014");
    getskuItemTest(undefined);
    getskuItembyskuIdTest(sku_id);
    getskuItembyskuIdTest("invalid");
    createskuItemTest("12345678901234567890123456789015", sku_id, "2022/01/23 14:30")
    modifyskuItemTest("12345678901234567890123456789014", "123456789012345678901230984567", 1, "2022/05/24 17:15")
    deleteskuItemTest("12345678901234567890123456789014");

})

function getAllskuItemsTest() {
    it('insert x sku items and get them', (done) => {
        agent.get('/api/skuitems')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].RFID.should.equal("12345678901234567890123456789014");
                        res.body[i].SKUId.should.equal(sku_id);
                        res.body[i].Available.should.equal(0);
                        res.body[i].DateOfStock.should.equal("2021/11/29 12:30");
                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function getskuItemTest(rfid) {
    it('get sku item: valid or invalid rfid ', (done) => {
        if (!isNaN(rfid) && rfid !== undefined) {
            agent.get('/api/skuitems/' + rfid).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            agent.get('/api/skuitems/' + rfid).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }
    })
}

function getskuItembyskuIdTest(sku_id) {
    it('get sku item by sku id: valid or invalid sku id ', (done) => {
        if (!isNaN(sku_id) && sku_id !== undefined) {
            agent.get('/api/skuitems/sku/' + sku_id).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            agent.get('/api/skuitems/sku/' + sku_id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }
    })
}

function createskuItemTest(rfid, skuid, date_of_stock) {
    it('create sku item', (done) => {
        const body = {
            "RFID": rfid,
            "SKUId": sku_id,
            "Available": 0,
            "DateOfStock": date_of_stock,
        };

        agent.post('/api/skuitem').send(body).then((res) => {
            res.should.have.status(201);
            done();
        }).catch((err) => {
            done(err);
        });
    })
}

function modifyskuItemTest(rfid, newRFID, newAvailable, newDateOfStock) {
    it('modify an existing sku item', (done) => {

        const body =
        {
            "newRFID": newRFID,
            "newAvailable": newAvailable,
            "newDateOfStock": newDateOfStock,
        }

        if (newAvailable === undefined || newDateOfStock === undefined &&
            newRFID === undefined || isNaN(newRFID)) {

            agent.put('/api/skuitems/' + rfid).send(body)
                .then(function (res) {
                    res.should.have.status(422);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        } else {
            agent.put('/api/skuitems/' + rfid).send(body)
                .then(function (res) {
                    res.should.have.status(200);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        }
    })
}

function deleteskuItemTest(rfid) {
    it('delete: valid or invalid rfid ', (done) => {
        if (rfid !== undefined && !isNaN(rfid)) {
            agent.delete('/api/skuitems/' + rfid).then((res) => {
                res.should.have.status(204);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            agent.delete('/api/skuitems/' + rfid).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }

    })
}
