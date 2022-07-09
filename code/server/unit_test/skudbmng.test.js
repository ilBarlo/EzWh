const SKUDBMNG = require('../modules/db/SKU_DBMNG');
const sku_dao = new SKUDBMNG("db.sqlite");
const SKU = require('../modules/backend/SKU');


describe('testDao', () => {
    beforeEach(async () => {
        await sku_dao.createTable();
        await sku_dao.deleteData();
        await sku_dao.deleteSeq();
    });

    test('delete table', async () => {
        var res = await sku_dao.getAll_SKU();
        expect(res.length).toStrictEqual(0);
    });

    testNewSKU('desc', 50, 100, "note", "12", 30, 5);

    testModifySKUandGetbyPos('desc', 50, 100, "note", "12", 30, 5);
});

function testNewSKU(dscrpt, w, v, note, pos, qty, price) {
    test('create new sku', async () => {

        const sku = new SKU(-1, dscrpt, w, v, note, pos, qty, price);
        var err = await sku_dao.createSKU(sku);


        var res = await sku_dao.getAll_SKU();
        expect(res.length).toStrictEqual(1);

        res = await sku_dao.getSKU(1);

        expect(res.description).toStrictEqual(dscrpt);
        expect(res.weight).toStrictEqual(w);
        expect(res.volume).toStrictEqual(v);
        expect(res.notes).toStrictEqual(note);
        expect(res.position).toStrictEqual(pos);
        expect(res.availableQuantity).toStrictEqual(qty);
        expect(res.price).toStrictEqual(price);

    });
}

function testModifySKUandGetbyPos(dscrpt, w, v, note, pos, qty, price) {
    test('modify sku', async () => {
        const old_sku = new SKU(-1, "dscrpt", 3, 3, "note", 3, 3, 3);
        await sku_dao.createSKU(old_sku);
        var res = await sku_dao.getAll_SKU();
        expect(res.length).toStrictEqual(1);


        const new_sku = new SKU(1, dscrpt, w, v, note, pos, qty, price);
        await sku_dao.modifySKU(new_sku);

        res = await sku_dao.getSKU(1);

        expect(res.description).toStrictEqual(dscrpt);
        expect(res.weight).toStrictEqual(w);
        expect(res.volume).toStrictEqual(v);
        expect(res.notes).toStrictEqual(note);
        expect(res.position).toStrictEqual(pos);
        expect(res.availableQuantity).toStrictEqual(qty);
        expect(res.price).toStrictEqual(price);

        const byPos = await sku_dao.getSKU_byPosition(pos);
        expect(byPos.id).toStrictEqual(1);
        expect(byPos.description).toStrictEqual(dscrpt);
        expect(byPos.weight).toStrictEqual(w);
        expect(byPos.volume).toStrictEqual(v);
        expect(byPos.notes).toStrictEqual(note);
        expect(byPos.availableQuantity).toStrictEqual(qty);
        expect(byPos.price).toStrictEqual(price);

        await sku_dao.deleteSKU(1);
        res = await sku_dao.getAll_SKU();
        expect(res.length).toStrictEqual(0);

    });

}
