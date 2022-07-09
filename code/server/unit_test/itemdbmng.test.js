const ITEMDBMNG = require('../modules/db/ITEM_DBMNG');
const item_dao = new ITEMDBMNG("db.sqlite");
const ITEM = require('../modules/backend/Item');

describe('testDao', () => {
    beforeEach(async () => {
        await item_dao.createTable();
        await item_dao.deleteData();
        await item_dao.deleteSeq();
    });

    test('delete table', async () => {
        var res = await item_dao.getAll_Item();
        expect(res.length).toStrictEqual(0);
    });

    testNewItem('a description', 10.99, 1, 2);

    testModifyandDeleteItem(1, 'a new description', 12.99);
});

function testNewItem(description, price, SKUId, supplierID) {
    test('create new item', async () => {

        const item = new ITEM(1, description, price, SKUId, supplierID)
        var err = await item_dao.createItem(item);

        var res = await item_dao.getAll_Item();

        expect(res.length).toStrictEqual(1);

        res = await item_dao.getItem_byId(1);
        expect(res.description).toStrictEqual(description);
        expect(res.price).toStrictEqual(price);
        expect(res.SKUId).toStrictEqual(SKUId);
        expect(res.supplierId).toStrictEqual(supplierID);

    });
}

function testModifyandDeleteItem(id, dscrpt, price) {
    test('modify and delete item', async () => {
        const old_item = new ITEM(1, 'a description', 10.99, 1, 2);
        await item_dao.createItem(old_item)
        var res = await item_dao.getAll_Item();
        expect(res.length).toStrictEqual(1);

        const body = {
            newDescription: dscrpt,
            newPrice: price
        }
        await item_dao.modifyItem(id, body);

        res = await item_dao.getItem_byId(1);
        expect(res.description).toStrictEqual(body.newDescription);
        expect(res.price).toStrictEqual(body.newPrice);
        expect(res.SKUId).toStrictEqual(id);

        await item_dao.deleteItem(1);
        res = await item_dao.getAll_Item();
        expect(res.length).toStrictEqual(0);
    });

}