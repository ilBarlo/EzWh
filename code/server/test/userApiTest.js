const chai = require('chai');
const chaiHttp = require('chai-http');
const { beforeEach } = require('mocha');
chai.use(chaiHttp);
chai.should();
const server = require('../server');

var agent = chai.request.agent(server);
const email_check = "user1@ezwh.com";

describe('test user apis', async () => {
    beforeEach(async () => {
        let res = await agent.get('/api/users');

        for (let user of res.body) {
            await agent.delete('/api/users/' + user.email + '/' + user.type);
        }
        const body = {
            "username": "user1@ezwh.com",
            "name": "John",
            "surname": "Smith",
            "password": "testpassword",
            "type": "supplier"
        }

        const check = await agent.post('/api/newUser').send(body);
        res = await agent.get('/api/users');

    });


    getAllusersTest();
    getAllsuppliersTest();
    createuserTest("f.barletta14@gmail.com", "Francesco", "Barletta", "testpassword", "customer");
    getSupplierSessions("user1@ezwh.com", "testpassword");
    getCustomerSessions();
    getClerkSessions();
    getdeliveryEmployeeSessions();
    getqualityEmployeeSessions();
    modifyRightsUser("user1@ezwh.com", "supplier", "clerk");
    modifyRightsUser("user1@ezwh.com", "supplier", "manager");
    deleteuserTest("user1@ezwh.com", "supplier");
    deleteuserTest("incorrectemail", "supplier");
})

function getAllusersTest() {
    it('insert x users and get them', (done) => {
        agent.get('/api/users')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {

                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function getAllsuppliersTest() {
    it('insert x suppliers and get them', (done) => {
        agent.get('/api/suppliers')
            .then(function (res) {
                res.should.have.status(200);
                if (res.body.length > 0) {
                    for (let i = 0; i < res.body.length; i++) {
                        res.body[i].EMAIL.should.equal("user1@ezwh.com");
                        res.body[i].NAME.should.equal("John");
                        res.body[i].SURNAME.should.equal("Smith");
                    }
                }
                done();
            })
            .catch(function (err) {
                done(err)
            });

    })
}

function getSupplierSessions(username, password) {
    it('get supplier sessions', (done) => {

        const body = {
            "username": username,
            "password": password,
        };

        agent.post('/api/supplierSessions').send(body).then((res) => {
            res.should.have.status(200);
            done();
        }).catch((err) => {
            console.log(err)
            done(err);
        });

    })
}

function getCustomerSessions() {
    it('insert a customer and get his session', (done) => {
        const body = {
            "username": "user2@ezwh.com",
            "name": "Marco",
            "surname": "Carta",
            "password": "testpassword",
            "type": "customer"
        };

        agent.post('/api/newUser').send(body).then((res) => {
            res.should.have.status(201);
            const body_session = {
                "username": body.username,
                "password": body.password,
            };

            agent.post('/api/customerSessions').send(body_session).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                console.log(err)
                done(err);
            });

        }).catch((err) => {
            console.log(err)
        });


    })
}

function getClerkSessions() {
    it('insert a clerk and get his session', (done) => {
        const body = {
            "username": "user3@ezwh.com",
            "name": "Marco",
            "surname": "Carta",
            "password": "testpassword",
            "type": "clerk"
        };

        agent.post('/api/newUser').send(body).then((res) => {
            res.should.have.status(201);
            const body_session = {
                "username": body.username,
                "password": body.password,
            };

            agent.post('/api/clerkSessions').send(body_session).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                console.log(err)
                done(err);
            });

        }).catch((err) => {
            console.log(err)
        });


    })
}

function getqualityEmployeeSessions() {
    it('insert a quality employee and get his session', (done) => {
        const body = {
            "username": "user2@ezwh.com",
            "name": "Marco",
            "surname": "Carta",
            "password": "testpassword",
            "type": "quality employee"
        };

        agent.post('/api/newUser').send(body).then((res) => {
            res.should.have.status(201);
            const body_session = {
                "username": body.username,
                "password": body.password,
            };

            agent.post('/api/qualityEmployeeSessions').send(body_session).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                console.log(err)
                done(err);
            });

        }).catch((err) => {
            console.log(err)
        });


    })
}

function getdeliveryEmployeeSessions() {
    it('insert a delivery employee and get his session', (done) => {
        const body = {
            "username": "user2@ezwh.com",
            "name": "Marco",
            "surname": "Carta",
            "password": "testpassword",
            "type": "delivery employee"
        };

        agent.post('/api/newUser').send(body).then((res) => {
            res.should.have.status(201);
            const body_session = {
                "username": body.username,
                "password": body.password,
            };

            agent.post('/api/deliveryEmployeeSessions').send(body_session).then((res) => {
                res.should.have.status(200);
                done();
            }).catch((err) => {
                console.log(err)
                done(err);
            });

        }).catch((err) => {
            console.log(err)
        });


    })
}


function createuserTest(username, name, surname, password, type) {
    it('create user', (done) => {
        const body = {
            "username": username,
            "name": name,
            "surname": surname,
            "password": password,
            "type": type
        };

        agent.post('/api/newUser').send(body).then((res) => {
            res.should.have.status(201);
            done();
        }).catch((err) => {
            console.log(err)
            done(err);
        });

    })
}

function modifyRightsUser(username, oldType, newType) {
    it('modify rights of a user, given its email and invalid/valid type', (done) => {

        const body =
        {
            "oldType": oldType,
            "newType": newType
        }

        if (newType === "adiministrator accounts" || newType === "manager") {
            agent.put('/api/users/' + username).send(body)
                .then(function (res) {
                    res.should.have.status(422);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        } else {
            agent.put('/api/users/' + username).send(body)
                .then(function (res) {
                    res.should.have.status(404);
                    done();
                })
                .catch(function (err) {
                    done(err)
                });
        }
    })
}

function deleteuserTest(email, type) {
    it('delete: valid or invalid email/type ', (done) => {
        if (email === email_check) {
            agent.delete('/api/users/' + email + '/' + type).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                console.log(err);
                done(err);
            });
        } else {
            agent.delete('/api/users/' + email + '/' + type).then((res) => {
                res.should.have.status(422);
                done();
            }).catch((err) => {
                done(err);
            });
        }

    })
}
