const DBInterface = require("../DBInterface");
const sku_dao = require("../modules/mock/skudb_mock");
const td_dao = require("../modules/mock/testdescriptordb_mock");

const EZWH = new DBInterface();
EZWH.sku = sku_dao;
EZWH.testDescriptor = td_dao;

describe('get skus', () => {
    beforeEach(() => {
        sku_dao.getAll_SKU.mockReset();
        sku_dao.getAll_SKU.mockReturnValueOnce(
            [{
                id: 1,
                dscrpt: "desc1",
                weight: 10,
                volume: 10,
                notes: "note1",
                position: 12234,
                availableQTY: 1000,
                price: 5,
                test_descriptors_ids: []
            },
            {
                id: 2,
                dscrpt: "desc1",
                weight: 10,
                volume: 10,
                notes: "note1",
                position: 12234,
                availableQTY: 1000,
                price: 5,
                test_descriptors_ids: []
            }]
        );
        td_dao.getTest_DescriptorsID_bySKU.mockReset();
        td_dao.getTest_DescriptorsID_bySKU.mockReturnValueOnce(
            [{
                id: 1,
                name: "name1",
                procedureDescription: "desc1",
                idSKU: 1
            }, {
                id: 2,
                name: "name1",
                procedureDescription: "desc1",
                idSKU: 1
            }]).mockReturnValueOnce([{
                id: 3,
                name: "name1",
                procedureDescription: "desc1",
                idSKU: 2
            }, {
                id: 4,
                name: "name1",
                procedureDescription: "desc1",
                idSKU: 2
            }]);

    });

    test('get skus', async () => {

        let res = await EZWH.getAll_SKU();
        expect(res).toStrictEqual(
            [{
                id: 1,
                dscrpt: "desc1",
                weight: 10,
                volume: 10,
                notes: "note1",
                position: 12234,
                availableQTY: 1000,
                price: 5,
                test_descriptors_ids: [1, 2]
            }, {
                id: 2,
                dscrpt: "desc1",
                weight: 10,
                volume: 10,
                notes: "note1",
                position: 12234,
                availableQTY: 1000,
                price: 5,
                test_descriptors_ids: [3, 4]
            }]
        );
    });

});