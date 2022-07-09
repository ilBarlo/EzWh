const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);

let sku_id = 0;
let io_id;

describe('test internal order apis', async () => {
    beforeEach(async () => {


        let res = await agent.get('/api/skus');
        if (res.body.length > 0) {
            for (let sku of res.body) {
                await agent.delete('/api/sku/' + sku.id);
            }
        }


        res = await agent.get('/api/internalOrders');

        for (let internal_order of res.body) {
            await agent.delete('/api/internalOrders/' + internal_order.id);
        }
        const body = {
            "issueDate": "2021/11/29 09:33",
            "products": [{ "SKUId": sku_id, "description": "a product", "price": 10.99, "qty": 3 }],
            "customerId": 1
        }
        const bodySku = {
            "description": "dscrpt",
            "weight": 4,
            "volume": 4,
            "notes": "note",
            "price": 4,
            "availableQuantity": 4
        }
        await agent.post('/api/internalOrders').send(body);
        await agent.post('/api/sku').send(bodySku);
        const res_sku = await agent.get('/api/skus');
        sku_id = res_sku.body[0].id;
        res = await agent.get('/api/internalOrders');
        io_id = res.body[0].id;
    });
    after(async () => {
        let res = await agent.get('/api/internalOrders');

        for (let internal_order of res.body) {
            await agent.delete('/api/internalOrders/' + internal_order.id);
        }
    })

    getAllInteralOrdersTest();
    getAllIssuedInteralOrdersTest();
    createInternalOrder("2022/05/24 19:16", 1, [{ "SKUId": sku_id, "description": "another product", "price": 12.99, "qty": 5 }])
    getInternalOrderTest(io_id);
    getInternalOrderTest("invalid");
    modifyInternalOrderTest(io_id, "DELIVERY");
    modifyInternalOrderTest(io_id, "COMPLETED", [{ "SKUId": sku_id, "RFID": "12345678901234567890123456789016" }]);
    deleteInternalOrder("invalid");
    deleteInternalOrder(io_id);
})

function getAllInteralOrdersTest() {
    it('insert x internal orders and get them', (done) => {
        agent.get('/api/internalOrders')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {

                        res.body[i].id.should.equal(io_id);
                        res.body[i].issue_date.should.equal("2021/11/29 09:33");
                        res.body[i].state.should.equal("ISSUED");
                        res.body[i].customer_id.should.equal(1);

                        /* Check for the products */
                        for (let j = 0; j < res.body[i].products.length; j++) {
                            res.body[i].products[j].SKUId.should.equal(sku_id);
                            res.body[i].products[j].description.should.equal("a product");
                            res.body[i].products[j].price.should.equal(10.99);
                            res.body[i].products[j].qty.should.equal(3);
                        }

                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function getAllIssuedInteralOrdersTest() {
    it('insert x issued internal orders and get them', (done) => {
        agent.get('/api/internalOrdersIssued')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {

                        res.body[i].id.should.equal(io_id);
                        res.body[i].issue_date.should.equal("2021/11/29 09:33");
                        res.body[i].state.should.equal("ISSUED");
                        res.body[i].customer_id.should.equal(1);

                        /* Check for the products */
                        for (let j = 0; j < res.body[i].products.length; j++) {
                            res.body[i].products[j].SKUId.should.equal(sku_id);
                            res.body[i].products[j].description.should.equal("a product");
                            res.body[i].products[j].price.should.equal(10.99);
                            res.body[i].products[j].qty.should.equal(3);
                        }

                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function createInternalOrder(issue_date, customer_id, products) {
    it('create sku', (done) => {
        const body = {
            "issueDate": issue_date,
            "products": products,
            "customerId": customer_id
        }

        agent.post('/api/internalOrders').send(body).then((res) => {
            res.should.have.status(201);
            done();
        }).catch((err) => {
            console.log(err);
            done(err);
        });
    })
}

function getInternalOrderTest(id) {
    it('get internal order: valid or invalid id ', (done) => {
        if (!isNaN(id) && id !== undefined) {
            agent.get('/api/internalOrders/' + id).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            agent.get('/api/internalOrders/' + id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }
    })
}

function modifyInternalOrderTest(id, newState, products) {
    it('modify an existing internal order: COMPLETED & Others', (done) => {

        const body =
        {
            "newState": newState,
            "products": products
        }

        if (newState === undefined || id === undefined || isNaN(id)) {
            agent.put('/api/internalOrders/' + id).send(body)
                .then(function (res) {
                    res.should.have.status(422);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        } else if (newState === "COMPLETED" && products === undefined) {
            agent.put('/api/internalOrders/' + id).send(body)
                .then(function (res) {
                    res.should.have.status(422);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        } else {
            agent.put('/api/internalOrders/' + id).send(body)
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

function deleteInternalOrder(id) {
    it('delete: valid or invalid id ', (done) => {
        if (id !== undefined && !isNaN(id)) {
            agent.delete('/api/internalOrders/' + id).then((res) => {
                res.should.have.status(204);
                done();
            }).catch((err) => {
                done(err);
            });
        } else {
            agent.delete('/api/internalOrders/' + id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }

    })
}

