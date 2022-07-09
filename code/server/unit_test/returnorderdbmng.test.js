const RO_DBMNG = require('../modules/db/RETURN_ORDER_DBMNG');
const RETURN_ORDER = require('../modules/backend/Return_Order');
const returnOrder_dao = new RO_DBMNG("db.sqlite");

describe('testDao', () => {
    beforeEach(async () => {
        await returnOrder_dao.createTable();
        await returnOrder_dao.deleteData();
        await returnOrder_dao.deleteSeq();

    });

    test('delete table', async () => {
        var res = await returnOrder_dao.getAll_ReturnOrders();
        expect(res.length).toStrictEqual(0);
    });

    testNewReturnOrder("2021/11/29 09:33", 1,
        [{ "SKUId": 12, "description": "a product", "price": 10.99, "RFID": "12345678901234567890123456789016" },
        { "SKUId": 180, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }]);


    testDeleteReturnOrder("2020/3/20 20:33", 5,
        [{ "SKUId": 10, "description": "a product", "price": 20.99, "RFID": "12345678901234567890123456789016" },
        { "SKUId": 100, "description": "another product", "price": 11.99, "RFID": "12345678901234567890123456789038" }])
});

function testNewReturnOrder(returnDate, restockOrderId, products) {
    test('create a new return order', async () => {
        const return_order = new RETURN_ORDER(-1, returnDate, restockOrderId);
        var err = await returnOrder_dao.createReturnOrder(return_order);


        for (let i = 0; i < products.length; i++) {
            return_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                RFID: products[i].RFID
            }
            await returnOrder_dao.createReturnProduct(1, products[i]);
        }
        var res = await returnOrder_dao.getAll_ReturnOrders();
        expect(res.length).toStrictEqual(1);

        let byId = await returnOrder_dao.getReturnOrder_byId(1);
        expect(byId.returnDate).toStrictEqual(returnDate);
        expect(byId.restockOrderId).toStrictEqual(restockOrderId);

        let byRSId = await returnOrder_dao.getReturnOrder_byRSId(restockOrderId);
        for (let i = 0; i < byRSId.length; i++) {
            expect(byRSId[0].returnDate).toStrictEqual(returnDate);
            expect(byRSId[0].restockOrderId).toStrictEqual(restockOrderId);
        }

        for (let i = 0; i < res.length; i++) {
            expect(res[0].returnDate).toStrictEqual(returnDate);
            expect(res[0].restockOrderId).toStrictEqual(restockOrderId);
        }

        const productsRO = await returnOrder_dao.getReturnOrderProducts(1);
        for (let i = 0; i < productsRO.length; i++) {
            expect(productsRO[i].SKUId).toStrictEqual(products[i].SKUId);
            expect(productsRO[i].RFID).toStrictEqual(products[i].RFID)
        }


    })
}

function testDeleteReturnOrder(returnDate, restockOrderId, products) {
    test('delete a return order', async () => {
        const return_order = new RETURN_ORDER(-1, returnDate, restockOrderId);
        var err = await returnOrder_dao.createReturnOrder(return_order);

        for (let i = 0; i < products.length; i++) {
            return_order.products[i] = {
                SKUId: products[i].SKUId,
                description: products[i].description,
                price: products[i].price,
                RFID: products[i].RFID
            }
            await returnOrder_dao.createReturnProduct(1, products[i]);
        }

        var res = await returnOrder_dao.getLastRO();
        expect(res.ID).toStrictEqual(1);



        await returnOrder_dao.deleteProducts_byRO(restockOrderId);
        await returnOrder_dao.deleteReturnOrder(1);
        var del = await returnOrder_dao.getAll_ReturnOrders();
        expect(del.length).toStrictEqual(0);
    })

}
