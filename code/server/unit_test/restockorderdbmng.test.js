const RESTOCKORDERDBMNG = require('../modules/db/RESTOCK_ORDER_DBMNG');
const restockOrder_dao = new RESTOCKORDERDBMNG("db.sqlite");
const RESTOCK_ORDER = require('../modules/backend/Restock_Order');
const PRODUCT = require('../modules/backend/Product');

describe('testDao', () => {
    beforeEach(async () => {
        await restockOrder_dao.createTable();
        await restockOrder_dao.deleteData();
        await restockOrder_dao.deleteSeq();

    });

    test('delete table', async () => {
        var res = await restockOrder_dao.getAll_RestockOrders();
        expect(res.length).toStrictEqual(0);
    });

    testNewRestockOrder(1, "COMPLETED", "2021/11/29 09:33", { "deliveryDate": "2021/12/29" },
        [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
        { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }],
        [{ "SKUId": 12, "RFID": "12345678901234567890123456789016" },
        { "SKUId": 12, "RFID": "12345678901234567890123456789017" }])

    testgetIssuedOrder(1, "ISSUED", "2021/11/29 09:33", { "deliveryDate": "2021/12/29" },
        [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
        { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }],
        [{ "SKUId": 12, "RFID": "12345678901234567890123456789016" },
        { "SKUId": 12, "RFID": "12345678901234567890123456789017" }])

    testModifyandDeleteRestockOrder(1, "COMPLETED");

});

function testNewRestockOrder(supplierId, state, issueDate, transportNote, products, skuItems) {
    test('create a new restock order', async () => {
        const restock_order = new RESTOCK_ORDER(-1, supplierId, state, issueDate, transportNote);

        var err = await restockOrder_dao.createRestockOrder(restock_order);
        await restockOrder_dao.addTransportNote_toRestockOrder(transportNote, 1);

        /* Products added for the Restock Order */
        for (let i = 0; i < products.length; i++) {
            restock_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                qty: products[i].qty
            };
            await restockOrder_dao.createProduct(1, products[i]);
        }

        /* SKU Items added for the Restock Order */
        for (let i = 0; i < skuItems.length; i++) {
            restock_order.skuItems[i] = {
                SKUId: skuItems[i].SKUId,
                RFID: skuItems[i].RFID,
            };
            await restockOrder_dao.addSkuItems_toRestockOrder(skuItems[i], 1);
        }

        var res = await restockOrder_dao.getAll_RestockOrders();
        expect(res.length).toStrictEqual(1);

        res = await restockOrder_dao.getRestockOrder_byId(1);

        expect(res.supplierId).toStrictEqual(supplierId);
        expect(res.state).toStrictEqual(state);
        expect(res.issueDate).toStrictEqual(issueDate);
        expect(res.transportNote).toStrictEqual(transportNote.deliveryDate);

        /* Check for the products of a certain RestockOrder */
        const productsOf = await restockOrder_dao.getProducts(1);
        for (let i = 0; i < productsOf.length; i++) {
            expect(productsOf[i].SKUId).toStrictEqual(products[i].SKUId);
            expect(productsOf[i].qty).toStrictEqual(products[i].qty)
        }

        /* Check for the SKU Items of a certain RestockOrder */
        const skuiOf = await restockOrder_dao.getSKUItem_RS(1)
        for (let i = 0; i < skuiOf.length; i++) {
            expect(skuiOf[i].SKUId).toStrictEqual(skuItems[i].SKUId);
            expect(skuiOf[i].rfid).toStrictEqual(skuItems[i].RFID);
        }

    });

}

function testgetIssuedOrder(supplierId, state, issueDate, transportNote, products, skuItems) {
    test('get an issued order', async () => {
        const restock_order = new RESTOCK_ORDER(-1, supplierId, state, issueDate, transportNote);

        var err = await restockOrder_dao.createRestockOrder(restock_order);
        await restockOrder_dao.addTransportNote_toRestockOrder(transportNote, 1);

        /* Products added for the Restock Order */
        for (let i = 0; i < products.length; i++) {
            restock_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                qty: products[i].qty
            };
            await restockOrder_dao.createProduct(1, products[i]);
        }

        /* SKU Items added for the Restock Order */
        for (let i = 0; i < skuItems.length; i++) {
            restock_order.skuItems[i] = {
                SKUId: skuItems[i].SKUId,
                RFID: skuItems[i].RFID,
            };
            await restockOrder_dao.addSkuItems_toRestockOrder(skuItems[i], 1);
        }

        var res = await restockOrder_dao.getAll_Issued_RestockOrders();
        expect(res.length).toStrictEqual(1);

        for (let i = 0; i < res.length; i++) {
            expect(res[0].supplierId).toStrictEqual(supplierId);
            expect(res[0].state).toStrictEqual(state);
            expect(res[0].issueDate).toStrictEqual(issueDate);
            expect(res[0].transportNote).toStrictEqual(transportNote.deliveryDate);
        }
        /* Check for the products of a certain RestockOrder */
        const productsOf = await restockOrder_dao.getProducts(1);
        for (let i = 0; i < productsOf.length; i++) {
            expect(productsOf[i].SKUId).toStrictEqual(products[i].SKUId);
            expect(productsOf[i].qty).toStrictEqual(products[i].qty)
        }

        /* Check for the SKU Items of a certain RestockOrder */
        const skuiOf = await restockOrder_dao.getSKUItem_RS(1)
        for (let i = 0; i < skuiOf.length; i++) {
            expect(skuiOf[i].SKUId).toStrictEqual(skuItems[i].SKUId);
            expect(skuiOf[i].rfid).toStrictEqual(skuItems[i].RFID);
        }

    });

}

function testModifyandDeleteRestockOrder(id, state) {
    test('modify and delete restock order', async () => {
        const restock_order = new RESTOCK_ORDER(-1, 1, "ISSUED", "2021/11/29 09:33", "deliveryDate:2021/12/29");

        const products = [{ "SKUId": 12, "description": "a product", "price": 10.99, "qty": 30 },
        { "SKUId": 180, "description": "another product", "price": 11.99, "qty": 20 }];

        const skuItems = [{ "SKUId": 12, "RFID": "12345678901234567890123456789016" },
        { "SKUId": 12, "RFID": "12345678901234567890123456789017" }];

        var err = await restockOrder_dao.createRestockOrder(restock_order);

        /* Products added for the Restock Order */
        for (let i = 0; i < products.length; i++) {
            restock_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                qty: products[i].qty
            };
            await restockOrder_dao.createProduct(1, products[i]);
        }

        /* SKU Items added for the Restock Order */
        for (let i = 0; i < skuItems.length; i++) {
            restock_order.skuItems[i] = {
                SKUId: skuItems[i].SKUId,
                RFID: skuItems[i].RFID,
            };
            await restockOrder_dao.addSkuItems_toRestockOrder(skuItems[i], 1);
        }


        await restockOrder_dao.modifyState_RestockOrder(id, state);

        res = await restockOrder_dao.getRestockOrder_byId(1);
        expect(res.state).toStrictEqual(state);

        await restockOrder_dao.deleteProducts_byRS(1);
        await restockOrder_dao.deleteSKUItems_byRS(1);
        await restockOrder_dao.deleteRestockOrder(1);
        res = await restockOrder_dao.getAll_RestockOrders();
        expect(res.length).toStrictEqual(0);

    });

}