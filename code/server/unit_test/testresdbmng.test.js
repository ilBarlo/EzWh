const TR_DBMNG = require('../modules/db/TEST_RESULT_DBMNG');
const TR = require('../modules/backend/Test_Result');
const tr_dao = new TR_DBMNG("db.sqlite");

describe('testDao', () => {
    beforeEach(async () => {
        await tr_dao.createTable();
        await tr_dao.deleteData();
        await tr_dao.deleteSeq();
    });

    testNewTestRes("12345678901", 10, "2021/11/28", true);

    testModifyandDeleteTestRes("9999", 5, "2022/12/22", true);
});

function testNewTestRes(RFID, idTestDescriptor, Date, Result) {
    test('create new test Result', async () => {

        const tr = new TR(-1, RFID, idTestDescriptor, Date, Result);
        await tr_dao.createTestResult(tr);

        let res = await tr_dao.getAllTestResults_byRFID(RFID);
        expect(res.length).toStrictEqual(1);
        res = res[0]
        expect(res.rfid).toStrictEqual(RFID);
        expect(res.idTestDescriptor).toStrictEqual(idTestDescriptor);
        expect(res.Date).toStrictEqual(Date);
        expect(res.Result).toStrictEqual(Result);
    });
}

function testModifyandDeleteTestRes(RFID, idTestDescriptor, Date, Result) {
    test('modify and delete test Result', async () => {
        const rfid = "1010101010101010"
        const old_tr = new TR(-1, rfid, 1, "22/2/2022", 1);
        await tr_dao.createTestResult(old_tr);

        const new_tr = new TR(1, RFID, idTestDescriptor, Date, Result)
        await tr_dao.modifyTestResult(new_tr);

        let res = await tr_dao.getTestResult_byId(1);

        expect(res.rfid).toStrictEqual(rfid);
        expect(res.idTestDescriptor).toStrictEqual(idTestDescriptor);
        expect(res.Date).toStrictEqual(Date);
        expect(res.Result).toStrictEqual(Result);

        await tr_dao.deleteTestResult(1);
        let tr = await tr_dao.getTestResult_byId(1);
        expect(tr).toStrictEqual(undefined);

    })
}
