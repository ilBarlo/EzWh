const TD_DBMNG = require('../modules/db/TEST_DESCRIPTOR_DBMNG');
const TD = require('../modules/backend/Test_Descriptor');
const td_dao = new TD_DBMNG("db.sqlite");

describe('testDao', () => {
    beforeEach(async () => {
        await td_dao.createTable();
        await td_dao.deleteData();
        await td_dao.deleteSeq();
    });

    test('delete table', async () => {
        var res = await td_dao.getAll_TestDescriptors();
        expect(res.length).toStrictEqual(0);
    });

    testNewTestDesc("test descriptor 1", "This test is described by...", 1);

    testGetTestDescbySku("test desc 2", "description", 2);

    testModifyandDeleteTestDesc("td 3", "desc 3", 3);

    testDeleteTestDescbySKUId("td 4", "d", 20);
});

function testNewTestDesc(name, procedure_description, sku_id) {
    test('create new test descriptor', async () => {

        const td = new TD(-1, name, procedure_description, sku_id);
        var err = await td_dao.createTestDescriptor(td);

        var res = await td_dao.getAll_TestDescriptors();
        expect(res.length).toStrictEqual(1);

        res = await td_dao.getTestDescriptors_byId(1);

        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedure_description);
        expect(res.idSKU).toStrictEqual(sku_id);

    });

}


function testGetTestDescbySku(name, procedure_description, sku_id) {
    test('get a test descriptor by skuid', async () => {
        const td = new TD(-1, name, procedure_description, sku_id);
        var err = await td_dao.createTestDescriptor(td);

        var res = await td_dao.getAll_TestDescriptors();
        expect(res.length).toStrictEqual(1);

        var bySku = await td_dao.getTest_DescriptorsID_bySKU(sku_id);
        expect(bySku.name).toStrictEqual(res.name);
        expect(bySku.procedureDescription).toStrictEqual(res.procedure_description);
        expect(bySku.idSKU).toStrictEqual(res.sku_id);
    })

}

function testModifyandDeleteTestDesc(name, procedure_description, sku_id) {
    test('modify and delete test descriptor', async () => {
        const old_td = new TD(-1, name, procedure_description, sku_id);
        var err = await td_dao.createTestDescriptor(old_td);

        var res = await td_dao.getAll_TestDescriptors();
        expect(res.length).toStrictEqual(1);

        const new_td = new TD(1, name, procedure_description, sku_id)
        await td_dao.modifyTestDescriptor(new_td);

        res = await td_dao.getTestDescriptors_byId(1);

        expect(res.name).toStrictEqual(name);
        expect(res.procedureDescription).toStrictEqual(procedure_description);
        expect(res.idSKU).toStrictEqual(sku_id);

        await td_dao.deleteTestDescriptor(1);
        let td = await td_dao.getAll_TestDescriptors();
        expect(td.length).toStrictEqual(0);

    })
}

function testDeleteTestDescbySKUId(name, procedure_description, sku_id) {
    test('delete test desctiptor by skuid', async () => {
        const td = new TD(-1, name, procedure_description, sku_id);
        var err = await td_dao.createTestDescriptor(td);

        var res = await td_dao.getAll_TestDescriptors();
        expect(res.length).toStrictEqual(1);

        await td_dao.deleteTestDescriptorsBySKUId(sku_id);
        let result = await td_dao.getAll_TestDescriptors();
        expect(result.length).toStrictEqual(0);
    })
}
