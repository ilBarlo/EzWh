const IO_DBMNG = require('../modules/db/INTERNAL_ORDER_DBMNG');
const INTERNAL_ORDER = require('../modules/backend/Internal_Order');
const internalOrder_dao = new IO_DBMNG("db.sqlite");

describe('testDao', () => {
    beforeEach(async () => {
        await internalOrder_dao.createTable();
        await internalOrder_dao.deleteData();
        await internalOrder_dao.deleteSeq();

    });

    test('delete table', async () => {
        var res = await internalOrder_dao.getAll_InternalOrders();
        expect(res.length).toStrictEqual(0);
    });

    testNewInternalOrder("2021/11/29 09:33", "ISSUED", 5, [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
    { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }]);

    testGetAcceptedInternalOrder("2022/12/20 09:33", "ACCEPTED", 100, [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 3 },
    { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 3 }]);

    testModifyInternalOrder({ "newState": "ACCEPTED" }, "RFID1", 1, "dscrpt1", 1, "RFID2", 2, "dscrpt2", 1, 1)
    testModifyInternalOrder({ "newState": "COMPLETED" }, "RFID1", 1, "dscrpt1", 1, "RFID2", 2, "dscrpt2", 1, 0)
});

function testNewInternalOrder(issue_date, state, customer_id, products) {
    test('create and get a new internal order', async () => {
        const internal_order = new INTERNAL_ORDER(-1, issue_date, state, customer_id);
        await internalOrder_dao.createInternalOrder(internal_order);

        for (let i = 0; i < products.length; i++) {
            internal_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                qty: products[i].qty
            }
            await internalOrder_dao.createProducts_IO(1, products[i]);
        }

        var res = await internalOrder_dao.getAll_InternalOrders();
        expect(res.length).toStrictEqual(1);

        for (let i = 0; i < res.length; i++) {
            expect(res[0].issue_date).toStrictEqual(issue_date);
            expect(res[0].state).toStrictEqual(state);
            expect(res[0].customer_id).toStrictEqual(customer_id);
        }

        let byId = await internalOrder_dao.getInternalOrder_byId(1);
        expect(byId.issue_date).toStrictEqual(issue_date);
        expect(byId.state).toStrictEqual(state);
        expect(byId.customer_id).toStrictEqual(customer_id);

        const productsIO = await internalOrder_dao.getProducts_IO(1);
        for (let i = 0; i < productsIO.length; i++) {
            expect(productsIO[i].SKU_ID).toStrictEqual(products[i].SKUId);
            expect(productsIO[i].DESCRIPTION).toStrictEqual(products[i].description)
            expect(productsIO[i].PRICE).toStrictEqual(products[i].price)
            expect(productsIO[i].QTY).toStrictEqual(products[i].qty)
        }

        const issued_io = await internalOrder_dao.getIssued_InternalOrders();
        for (let i = 0; i < issued_io.length; i++) {
            expect(issued_io[0].issue_date).toStrictEqual(issue_date);
            expect(issued_io[0].state).toStrictEqual(state);
            expect(issued_io[0].customer_id).toStrictEqual(customer_id);
        }
    })
}

function testGetAcceptedInternalOrder(issue_date, state, customer_id, products) {
    test('get and delete accepted internal order', async () => {
        const internal_order = new INTERNAL_ORDER(-1, issue_date, state, customer_id);
        var err = await internalOrder_dao.createInternalOrder(internal_order);

        for (let i = 0; i < products.length; i++) {
            internal_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                qty: products[i].qty
            }
            await internalOrder_dao.createProducts_IO(1, products[i]);
        }

        const accepted = await internalOrder_dao.getAccepted_InternalOrders();
        for (let i = 0; i < accepted.length; i++) {
            expect(accepted[0].issue_date).toStrictEqual(issue_date);
            expect(accepted[0].state).toStrictEqual(state);
            expect(accepted[0].customer_id).toStrictEqual(customer_id);
        }


        const productIO = await internalOrder_dao.getProducts_IO(1);
        for (let i = 0; i < productIO.length; i++) {
            expect(productIO[i].SKU_ID).toStrictEqual(products[i].SKUId);
            expect(productIO[i].DESCRIPTION).toStrictEqual(products[i].description)
            expect(productIO[i].PRICE).toStrictEqual(products[i].price)
            expect(productIO[i].QTY).toStrictEqual(products[i].qty)
        }

        await internalOrder_dao.deleteProducts_IO(1);
        await internalOrder_dao.deleteInternalOrder(1);
        var del = await internalOrder_dao.getAll_InternalOrders();
        expect(del.length).toStrictEqual(0);

    })
}


function testModifyInternalOrder(newState, RFID1, skuid1, dscrpt1, price1, RFID2, skuid2, dscrpt2, price2, id) {
    test('create, modify and delete internal order', async () => {

        const internal_order = new INTERNAL_ORDER(-1, "22/10/2012", "ISSUED", 3);
        await internalOrder_dao.createInternalOrder(internal_order);

        const sku1 = { "id": skuid1, "dscrpt": dscrpt1, "price": price1 };
        const skui1 = { "RFID": RFID1 };

        const sku2 = { "id": skuid2, "dscrpt": dscrpt2, "price": price2 };
        const skui2 = { "RFID": RFID2 };

        await internalOrder_dao.createSkuItems_inInternalOrder(skui1, id, sku1);
        await internalOrder_dao.createSkuItems_inInternalOrder(skui2, id, sku2);

        let res = await internalOrder_dao.getProducts_CompletedIO(1);
        if (id === 1) {
            expect(res.length).toStrictEqual(2);
            expect(res[0].RFID).toStrictEqual(RFID1);
            expect(res[0].SKU_ID).toStrictEqual(skuid1);
            expect(res[0].DESCRIPTION).toStrictEqual(dscrpt1);
            expect(res[0].PRICE).toStrictEqual(price1);
            expect(res[1].RFID).toStrictEqual(RFID2);
            expect(res[1].SKU_ID).toStrictEqual(skuid2);
            expect(res[1].DESCRIPTION).toStrictEqual(dscrpt2);
            expect(res[1].PRICE).toStrictEqual(price2);
        } else {
            expect(res.length).toStrictEqual(0);
        }

        await internalOrder_dao.modifyState_InternalOrder(id, newState);
        res = await internalOrder_dao.getInternalOrder_byId(id);
        if (id === 1) {
            expect(res.state).toStrictEqual(newState.newState);
        } else {
            expect(res).toStrictEqual(undefined);
        }

        await internalOrder_dao.deleteInternalOrder(id);
        await internalOrder_dao.deleteProducts_IO(id);
        await internalOrder_dao.deleteSKUItems_IO(id);


        if (id === 1) {
            res = await internalOrder_dao.getAll_InternalOrders();
            expect(res.length).toStrictEqual(0);
            res = await internalOrder_dao.getProducts_IO(1);
            expect(res.length).toStrictEqual(0);
            res = await internalOrder_dao.getProducts_CompletedIO(1);
            expect(res.length).toStrictEqual(0);
        } else {
            res = await internalOrder_dao.getAll_InternalOrders();
            expect(res.length).toStrictEqual(1);
        }


    });
}
