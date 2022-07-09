const POSDBMNG = require('../modules/db/POSITION_DBMNG');
const POSITION = require('../modules/backend/Position');
const pos_dao = new POSDBMNG("db.sqlite");

describe('testDao', () => {
    beforeEach(async () => {
        await pos_dao.createTable();
        await pos_dao.deleteData();
    });

    test('delete table', async () => {
        var res = await pos_dao.getAll_Positions();
        expect(res.length).toStrictEqual(0);
    });

    testNewPosition("800234543412", "8002", "3454", "3412", 1000, 1000, 0, 0);

    testModifyandDeletePosition("800234543412", "8000", "3400", "3300", 1200, 600, 200, 100);

    testModifyPositionId("800234543412", "7000", "3000", "2000");
});

function testNewPosition(id, aisle, r, c, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('create new position', async () => {

        const position = new POSITION(id, aisle, r, c, maxWeight, maxVolume, occupiedWeight, occupiedVolume);
        var err = await pos_dao.createPosition(position);

        var res = await pos_dao.getAll_Positions();
        expect(res.length).toStrictEqual(1);

        res = await pos_dao.getPosition(id);

        expect(res.aisleID).toStrictEqual(aisle);
        expect(res.row).toStrictEqual(r);
        expect(res.col).toStrictEqual(c);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(res.occupiedWeight).toStrictEqual(occupiedWeight);
        expect(res.occupiedVolume).toStrictEqual(occupiedVolume);
    });

}

function testModifyandDeletePosition(id, aisle, r, c, maxWeight, maxVolume, occupiedWeight, occupiedVolume) {
    test('modify and delete position', async () => {
        const old_pos = new POSITION("800234543412", "8002", "3454", "3412", 1000, 1000, 0, 0);
        await pos_dao.createPosition(old_pos);
        var res = await pos_dao.getAll_Positions();
        expect(res.length).toStrictEqual(1);

        const new_pos = new POSITION(id, aisle, r, c, maxWeight, maxVolume, occupiedWeight, occupiedVolume);
        await pos_dao.modifyPosition(new_pos, old_pos.positionID);

        res = await pos_dao.getPosition(id);

        expect(res.positionID).toStrictEqual(id);
        expect(res.aisleID).toStrictEqual(aisle);
        expect(res.row).toStrictEqual(r);
        expect(res.col).toStrictEqual(c);
        expect(res.maxWeight).toStrictEqual(maxWeight);
        expect(res.maxVolume).toStrictEqual(maxVolume);
        expect(res.occupiedWeight).toStrictEqual(occupiedWeight);
        expect(res.occupiedVolume).toStrictEqual(occupiedVolume);

        await pos_dao.deletePosition(id);
        res = await pos_dao.getAll_Positions();
        expect(res.length).toStrictEqual(0);
    });
}

function testModifyPositionId(id, aisle, r, c) {
    test('modify position id', async () => {
        const old_pos = new POSITION("800234543412", "8002", "3454", "3412", 1000, 1000, 0, 0);
        await pos_dao.createPosition(old_pos);
        var res = await pos_dao.getAll_Positions();
        expect(res.length).toStrictEqual(1);


        const new_pos = new POSITION(id, aisle, r, c);
        await pos_dao.modifyPositionID(new_pos, old_pos.positionID);

        res = await pos_dao.getPosition(id);
        expect(res.positionID).toStrictEqual(id);
        expect(res.aisleID).toStrictEqual(aisle);
        expect(res.row).toStrictEqual(r);
        expect(res.col).toStrictEqual(c);

    })
}
