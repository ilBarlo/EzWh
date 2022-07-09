const SKUDBMNG = require('../modules/db/SKU_DBMNG');
const SKU = require('../modules/backend/SKU');
const TEST_DESCRIPTOR_DBMNG = require('../modules/db/TEST_DESCRIPTOR_DBMNG');
const TEST_DESCRIPTOR = require('../modules/backend/Test_Descriptor');
const POSITION_DBMNG = require("../modules/db/POSITION_DBMNG")
const POSITION = require("../modules/backend/Position");
const RESTOCK_ORDER_DBMNG = require("../modules/db/RESTOCK_ORDER_DBMNG");
const RESTOCK_ORDER = require("../modules/backend/Restock_Order");
const PRODUCT = require("../modules/backend/Product");
const SKUITEM_DBMNG = require("../modules/db/SKUITEM_DBMNG");
const SUITEM = require("../modules/backend/SKU_Item");

const skui_dao = new SKUITEM_DBMNG("db.sqlite");
const rs_dao = new RESTOCK_ORDER_DBMNG("db.sqlite");
const sku_dao = new SKUDBMNG("db.sqlite");
const td_dao = new TEST_DESCRIPTOR_DBMNG("db.sqlite");
const pos_dao = new POSITION_DBMNG("db.sqlite")

const DBInterface = require("../DBInterface");

const EZWH = new DBInterface();
EZWH.init("db.sqlite");

describe('skus', () => {
    beforeEach(async () => {
        await sku_dao.deleteSeq();
        await td_dao.deleteSeq();

        await sku_dao.deleteData();
        await td_dao.deleteData();
        await pos_dao.deleteData();
    });

    test_getskus1('desc', 50, 100, "note", "12", 30, 5);
    test_getskus2('desc', 50, 100, "note", "12", 30, 5);
    test_getskus3('desc', 50, 100, "note", "12", 30, 5);
    test_getSKU_bySKUid(1);
    test_getSKU_bySKUid();
    test_createAndDelete('desc', 50, 100, "note", 12, 30, 1);
    test_modifySKU(1, "newDscrpt", 10, 10, "gh", "4321", 2, 5);


});

describe('position', () => {
    beforeEach(async () => {
        await sku_dao.deleteSeq();
        await td_dao.deleteSeq();

        await sku_dao.deleteData();
        await td_dao.deleteData();
        await pos_dao.deleteData();
    });

    test_modifyPositionID("000100010002");
    test_modifyPosition(undefined, "0003", "0004", "0005", 100, 100, 5, 5)
    test_modifyPosition("000100010001", "0003", "0004", "0005", 100, 100, 5, 5)
})

describe('restock order', () => {
    beforeEach(async () => {
        await sku_dao.deleteSeq();
        await rs_dao.deleteSeq();

        await sku_dao.deleteData();
        await skui_dao.deleteData();
        await pos_dao.deleteData();
        await rs_dao.deleteData();
    });

    test_create_and_delete_rs();
    test_modify_rs1(1, "MODIFIED", "hello");
    test_modify_rs1(0, "MODIFIED", "hello");
    test_modify_rs1(1, "MODIFIED");

    let skuitems = [{
        "rfid": "8028028308203",
        "SKUId": 1
    }, {
        "rfid": "8028024308203",
        "SKUId": 1
    }]
    test_modify_rs2(1, skuitems);
    test_modify_rs2(3, skuitems);



})
async function test_getskus1() {
    test('get skus no skus', async () => {
        let res = await EZWH.getAll_SKU();
        expect(res.length).toStrictEqual(0);
    });
}

async function test_getskus2(description, w, v, note, pos, qty, price) {
    test('get 1 sku no td', async () => {
        const sku = new SKU(-1, description, w, v, note, pos, qty, price);
        await sku_dao.createSKU(sku);
        let res = await EZWH.getAll_SKU();
        expect(res).toEqual([{
            id: 1,
            description: description,
            weight: w,
            volume: v,
            notes: note,
            position: pos,
            availableQuantity: qty,
            price: price,
            testDescriptors: []
        }]);
    });
}

async function test_getskus3(description, w, v, note, pos, qty, price) {
    test('get 1 sku 1 td', async () => {
        const sku = new SKU(-1, description, w, v, note, pos, qty, price);
        await sku_dao.createSKU(sku);
        const td = new TEST_DESCRIPTOR(-1, "td1", "desc", 1);
        await td_dao.createTestDescriptor(td);
        let res = await EZWH.getAll_SKU();
        expect(res).toEqual([{
            id: 1,
            description: description,
            weight: w,
            volume: v,
            notes: note,
            position: pos,
            availableQuantity: qty,
            price: price,
            testDescriptors: [1]
        }]);
    });
}

async function test_getSKU_bySKUid(id) {
    test('get sku with found/not found id', async () => {
        const sku = new SKU(-1, "description", 20, 20, "note", 1234, 33, 5);
        await sku_dao.createSKU(sku);
        const td = new TEST_DESCRIPTOR(-1, "td1", "desc", 1);
        await td_dao.createTestDescriptor(td);

        let res = await EZWH.getSKU_bySKUid(id);
        if (id === 1) {
            expect(res).toEqual({
                id: 1,
                description: "description",
                weight: 20,
                volume: 20,
                notes: "note",
                position: "1234",
                availableQuantity: 33,
                price: 5,
                testDescriptors: [1]
            });
        } else {
            expect(res).toStrictEqual(undefined);
        }
    });
}

async function test_createAndDelete(description, w, v, note, qty, price, id_delete) {
    test('create and delete sku', async () => {
        const body = { "description": description, "weight": w, "volume": v, "notes": note, "availableQuantity": qty, "price": price };
        await EZWH.createSKU(body);
        const td = new TEST_DESCRIPTOR(-1, "td1", "desc", 1);
        const td_body = { "name": "td1", "procedureDescription": "desc", "idSKU": 1 };
        await EZWH.createTestDescriptor(td);
        let res = await EZWH.getAll_SKU();
        expect(res).toEqual([{
            id: 1,
            description: description,
            weight: w,
            volume: v,
            notes: note,
            availableQuantity: qty,
            price: price,
            testDescriptors: [1]
        }]);

        await EZWH.deleteSKU(id_delete);
        res = await EZWH.getAll_SKU();
        if (id_delete === 1) {
            expect(res.length).toEqual(0);
        } else {
            expect(res).toEqual([{
                id: 1,
                description: description,
                weight: w,
                volume: v,
                notes: note,
                availableQuantity: qty,
                price: price,
                testDescriptors: [1]
            }]);
        }
        res = await EZWH.getAll_TestDescriptors();
        if (id_delete === 1) {
            expect(res.length).toStrictEqual(0);
        } else {
            expect(res).toEqual([{
                "id": 1, "name": "td1", "procedureDescription": "desc", "idSKU": 1
            }]);
        }
    });
}

async function test_modifySKU(id, newDscrpt, newW, newV, newNote, newPos, newQty, newPrice, newTestDescriptors) {
    test('modify SKU', async () => {
        const sku = new SKU(-1, "description", 5, 5, "note", "1234", 5, 12);
        await sku_dao.createSKU(sku);
        const pos = new POSITION("1234", "12", "3", "4", 50, 50, 0, 0);
        await pos_dao.createPosition(pos);
        const body = {
            "newDescription": newDscrpt,
            "newWeight": newW,
            "newVolume": newV,
            "newNotes": newNote,
            "newPosition": newPos,
            "newAvailableQTY": newQty,
            "newPrice": newPrice,
            "newTestDescriptors": newTestDescriptors
        }

        await EZWH.modifySKU(id, body);

        const tds = await EZWH.getAll_TestDescriptors();
        let res = await EZWH.getAll_SKU();
        expect(res[0].id).toStrictEqual(id);
        expect(res[0].description).toEqual(newDscrpt || "description");
        expect(res[0].weight).toEqual(newW || 5);
        expect(res[0].volume).toEqual(newV || 5);
        expect(res[0].notes).toEqual(newNote || "note");
        expect(res[0].position).toEqual(newPos || "1234");
        expect(res[0].availableQuantity).toEqual(newQty || 5);
        expect(res[0].price).toEqual(newPrice || 12);
        if (newTestDescriptors) {
            expect(res[0].testDescriptors.length).toStrictEqual(newTestDescriptors.length)

        } else {
            expect(res[0].testDescriptors.length).toStrictEqual(0)
        }
    })
}

async function test_modifyPositionID(newPositionID) {
    test('modify positionid', async () => {
        let body = {
            "positionID": "000100010001",
            "aisleID": "0001",
            "row": "0001",
            "col": "0001",
            "maxWeight": 50,
            "maxVolume": 50
        }
        await EZWH.createPosition(body);
        body = { "newPositionID": newPositionID };
        await EZWH.modifyPosition(body, "000100010001");
        let res = await EZWH.getAll_Positions();
        expect(res[0].id).toStrictEqual("000100010002");


    })
};

async function test_modifyPosition(oldid, newAisleID, newRow, newCol, newMW, newMV, newOW, newOV) {
    test('modify positionid', async () => {
        let body = {
            "positionID": "000100010001",
            "aisleID": "0001",
            "row": "0001",
            "col": "0001",
            "maxWeight": 50,
            "maxVolume": 50
        }
        const bodySKU = {
            "description": "description",
            "weight": 20,
            "volume": 20,
            "notes": "note",
            "availableQuantity": 3,
            "price": 5
        }
        await EZWH.createSKU(bodySKU);
        await EZWH.createPosition(body);

        let res = await EZWH.getAll_SKU();
        expect(res.length).toStrictEqual(1);
        res = await EZWH.getAll_Positions();
        expect(res.length).toStrictEqual(1);



        body = {
            "newAisleID": newAisleID,
            "newRow": newRow,
            "newCol": newCol,
            "newMaxWeight": newMW,
            "newMaxVolume": newMV,
            "newOccupiedWeight": newOW,
            "newOccupiedVolume": newOV
        }
        await EZWH.modifyPosition(body, oldid);
        res = await EZWH.getAll_Positions();
        if (oldid === "000100010001") {
            const newID = newAisleID + newRow + newCol
            body = { "newPosition": newID }
            await EZWH.modifySKU(1, body)

            let res1 = await EZWH.getSKU_bySKUid(1);

            expect(res[0].id).toStrictEqual(newID);
            expect(res[0].aisleid).toStrictEqual(newAisleID);
            expect(res[0].row).toStrictEqual(newRow);
            expect(res[0].col).toStrictEqual(newCol);
            expect(res[0].maxWeight).toStrictEqual(newMW);
            expect(res[0].maxVolume).toStrictEqual(newMV);
            expect(res[0].occupiedWeight).toStrictEqual(newOW);
            expect(res[0].occupiedVolume).toStrictEqual(newOV);

            expect(res1.position).toStrictEqual(newID);

        } else {
            expect(res[0].id).toStrictEqual("000100010001");
            expect(res[0].aisleid).toStrictEqual("0001");
            expect(res[0].row).toStrictEqual("0001");
            expect(res[0].col).toStrictEqual("0001");
            expect(res[0].maxWeight).toStrictEqual(50);
            expect(res[0].maxVolume).toStrictEqual(50);
            expect(res[0].occupiedWeight).toStrictEqual(0);
            expect(res[0].occupiedVolume).toStrictEqual(0);

        }
    });
}

async function test_create_and_delete_rs() {
    test('create and delete restock order', async () => {
        let res = await EZWH.getAll_RestockOrders();
        expect(res.length).toStrictEqual(0);

        let body = {
            "supplierId": 1,
            "issueDate": "2021/11/1",
            "products": [{
                "SKUId": 1,
                "qty": 10
            }, {
                "SKUId": 2,
                "qty": 11
            }]
        }

        const bodySKU = {
            "description": "description",
            "weight": 20,
            "volume": 20,
            "notes": "note",
            "availableQuantity": 3,
            "price": 5
        }
        await EZWH.createSKU(bodySKU);
        await EZWH.createSKU(bodySKU);

        await EZWH.createRestockOrder(body);

        res = await EZWH.getAll_RestockOrders();
        expect(res[0].id).toStrictEqual(1);
        expect(res[0].supplierId).toStrictEqual(1);
        expect(res[0].IssueDate).toStrictEqual("2021/11/1");
        expect(res[0].state).toStrictEqual("ISSUED");
        expect(res[0].products.length).toStrictEqual(2);
        expect(res[0].products[0].SKUId).toStrictEqual(1);
        expect(res[0].products[1].SKUId).toStrictEqual(2);
        expect(res[0].products[0].qty).toStrictEqual(10);
        expect(res[0].products[1].qty).toStrictEqual(11);


        await EZWH.deleteRestockOrder(1);
        res = await EZWH.getAll_RestockOrders();
        expect(res.length).toStrictEqual(0);
        res = await rs_dao.getProducts(1);
        expect(res.length).toStrictEqual(0);

    })
}

async function test_modify_rs1(id, newState, newTransportNote) {
    test('modify restock order state and transportNote', async () => {
        let body = {
            "supplierId": 1,
            "issueDate": "2021/11/1",
            "products": [{
                "SKUId": 1,
                "qty": 10
            }, {
                "SKUId": 2,
                "qty": 11
            }]
        }

        const bodySKU = {
            "description": "description",
            "weight": 20,
            "volume": 20,
            "notes": "note",
            "availableQuantity": 3,
            "price": 5
        }
        await EZWH.createSKU(bodySKU);
        await EZWH.createSKU(bodySKU);
        await EZWH.createRestockOrder(body);
        await EZWH.modifyState_RestockOrder(id, newState)
        await EZWH.addTransportNote_toRestockOrder(newTransportNote, id)
        let res = await EZWH.getRestockOrder_byId(id);

        if (id === 1) {
            expect(res.state).toStrictEqual(newState);
            expect(res.transportNote).toStrictEqual(newTransportNote);
        } else {
            expect(res).toStrictEqual(undefined);
        }

    })
}

async function test_modify_rs2(id, skuitems) {
    test('add skuitems', async () => {
        let body = {
            "supplierId": 1,
            "issueDate": "2021/11/1",
            "products": [{
                "SKUId": 1,
                "qty": 10
            }, {
                "SKUId": 2,
                "qty": 11
            }]
        }

        const bodySKU = {
            "description": "description",
            "weight": 20,
            "volume": 20,
            "notes": "note",
            "availableQuantity": 3,
            "price": 5
        }
        await EZWH.createSKU(bodySKU);
        await EZWH.createSKU(bodySKU);
        await EZWH.createRestockOrder(body);


        await EZWH.addSkuItems_toRestockOrder(skuitems, id)
        await EZWH.modifyState_RestockOrder(id, "DELIVERED")

        let res = await EZWH.getRestockOrder_byId(id);


        if (id === 1) {
            expect(res.state).toStrictEqual("DELIVERED");
            expect(res.SKUItemList.length).toStrictEqual(skuitems.length);
            expect(res.SKUItemList).toContainEqual(skuitems[0]);
            expect(res.SKUItemList).toContainEqual(skuitems[1]);

        } else {
            expect(res).toStrictEqual(undefined);
        }

    })
}




