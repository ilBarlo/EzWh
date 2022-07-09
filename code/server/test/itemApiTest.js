const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);
let sku_id = 0;

describe('test item apis', async () => {
    beforeEach(async () => {
        const res_sku = await agent.get('/api/skus');
        sku_id = res_sku.body[0].id;

        let res = await agent.get('/api/items');
        for (let item of res.body) {
            await agent.delete('/api/items/' + item.id);
        }
        const body = {
            "id": 12,
            "description": "a new item",
            "price": 10.99,
            "SKUId": sku_id,
            "supplierId": 2
        }
        const check = await agent.post('/api/item').send(body);
    });
    after(async () => {
        let res = await agent.get('/api/items');
        for (let item of res.body) {
            await agent.delete('/api/items/' + item.id);
        }
    })

    getAllitemsTest();
    getItemTest(12);
    getItemTest("not valid");
    modifyItemTest(12, "a new description", 12.99);
    createItemTest(10, "another item", 13.99, 1);
    deleteItemTest(undefined);
    deleteItemTest(12);
})

function getAllitemsTest() {
    it('insert x items and get them', (done) => {
        agent.get('/api/items')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].id.should.equal(12);
                        res.body[i].description.should.equal("a new item");
                        res.body[i].price.should.equal(10.99);
                        res.body[i].SKUId.should.equal(sku_id);
                        res.body[i].supplierId.should.equal(2);
                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function getItemTest(id) {
    it('get element: valid or invalid id ', (done) => {
        if (!isNaN(id)) {
            if (id === 12) {
                agent.get('/api/items/' + id).then((res) => {
                    res.should.have.status(200);
                    done();
                }).catch((err) => {
                    done(err);
                });
            } else {
                agent.get('/api/items/' + id).then((res) => {
                    res.should.have.status(404);
                    done();
                }).catch((err) => {
                    done(err);
                });
            }
        } else {
            agent.get('/api/items/' + id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }
    })
}

function modifyItemTest(id, newDescription, newPrice) {
    it('modify an existing item', (done) => {

        const body =
        {
            "newDescription": newDescription,
            "newPrice": newPrice
        }

        if (newDescription === undefined || newPrice === undefined) {
            agent.put('/api/item/' + id).send(body)
                .then(function (res) {
                    res.should.have.status(422);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        } else {
            agent.put('/api/item/' + id).send(body)
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

function createItemTest(id, description, price, supplierId) {
    it('create sku', (done) => {
        const body = {
            "id": id,
            "description": description,
            "price": price,
            "SKUId": sku_id,
            "supplierId": supplierId
        };

        agent.post('/api/item').send(body).then((res) => {
            res.should.have.status(201);
            done();
        }).catch((err) => {
            console.log(err);
            done(err);
        });
    })
}

function deleteItemTest(id) {
    it('delete: valid or invalid id ', (done) => {
        if (id !== undefined || !isNaN(id)) {
            agent.delete('/api/items/' + id).then((res) => {
                res.should.have.status(204);
                done();
            }).catch((err) => {
                console.log(err);
                done(err);
            });
        } else {
            agent.delete('/api/items/' + id).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }

    })
}
