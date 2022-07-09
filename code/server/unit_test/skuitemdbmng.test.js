const SKUITEMDBMNG = require('../modules/db/SKUITEM_DBMNG');
const skuItem_dao = new SKUITEMDBMNG("db.sqlite");
const SKUITEM = require('../modules/backend/SKU_Item');


describe('testDao', () => {
    beforeEach(async () => {
        await skuItem_dao.createTable();
        await skuItem_dao.deleteData();
    });

    test('delete table', async () => {
        var res = await skuItem_dao.getAll_SKUItems()
        expect(res.length).toStrictEqual(0);
    });

    testNewSKUItem("12345678901234567890123456789014", 1, 1, "2021/11/29 12:30");

    testModifyandDeleteSKUItem("1234567899876543211234568097009", 1, 1, "2022/05/29 11:30");
});

function testNewSKUItem(rfid, skuid, available, date_of_stock) {
    test('create new sku item', async () => {

        const sku_item = new SKUITEM(rfid, skuid, available, date_of_stock);
        var err = await skuItem_dao.createSKUItem(sku_item);

        var res = await skuItem_dao.getAll_SKUItems();
        expect(res.length).toStrictEqual(1);

        res = await skuItem_dao.getSKUItems_bySKUid(skuid);

        if (res[0].Available) {
            expect(res[0].RFID).toStrictEqual(rfid);
            expect(res[0].SKUId).toStrictEqual(skuid);
            expect(res[0].Available).toStrictEqual(available);
            expect(res[0].DateOfStock).toStrictEqual(date_of_stock);
        }

        res = await skuItem_dao.getSKUItem_byRFID(rfid);

        expect(res.RFID).toStrictEqual(rfid);
        expect(res.SKUId).toStrictEqual(skuid);
        expect(res.Available).toStrictEqual(available);
        expect(res.DateOfStock).toStrictEqual(date_of_stock);


    });
}

function testModifyandDeleteSKUItem(rfid, skuid, available, date_of_stock) {
    test('modify and delete sku item', async () => {
        const old_skuItem = new SKUITEM("12345678901234567890123456789014", 1, 1, "2021/11/29 12:30");
        await skuItem_dao.createSKUItem(old_skuItem);
        var res = await skuItem_dao.getAll_SKUItems();
        expect(res.length).toStrictEqual(1);

        const new_skuItem = new SKUITEM(rfid, skuid, available, date_of_stock);
        await skuItem_dao.modifySKU_Item(new_skuItem, old_skuItem.RFID);

        res = await skuItem_dao.getSKUItem_byRFID(rfid);

        expect(res.RFID).toStrictEqual(rfid);
        expect(res.SKUId).toStrictEqual(skuid);
        expect(res.Available).toStrictEqual(available);
        expect(res.DateOfStock).toStrictEqual(date_of_stock);

        await skuItem_dao.deleteSKUItem(rfid);
        res = await skuItem_dao.getAll_SKUItems();
        expect(res.length).toStrictEqual(0);

    });

}