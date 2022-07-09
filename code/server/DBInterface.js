"use strict"

const dayjs = require("dayjs");
const bcrypt = require('bcryptjs');

const Position = require("./modules/backend/Position");
const Restock_Order = require("./modules/backend/Restock_Order");
const Return_Order = require("./modules/backend/Return_Order");
const Internal_Order = require("./modules/backend/Internal_Order");
const SKU = require("./modules/backend/SKU");
const SKU_Item = require("./modules/backend/SKU_Item");
const Test_Descriptor = require("./modules/backend/Test_Descriptor");
const Test_Result = require("./modules/backend/Test_Result");
const User = require("./modules/backend/User");
const Item = require("./modules/backend/Item");



const user6 = {
    "name": "Daycol",
    "surname": "Orsini",
    "type": " deliveryEmployee",
    "username": "deliveryEmployee1@ezwh.com",
    "password": "testpassword"
}
const user5 = {
    "name": "Fabrizio",
    "surname": "Tarducci",
    "type": " qualityEmployee",
    "username": "qualityEmployee1@ezwh.com",
    "password": "testpassword"
}
const user4 = {
    "name": "Clemente",
    "surname": "Maccaro",
    "type": "customer",
    "username": "user1@ezwh.com",
    "password": "testpassword"
}
const user3 = {
    "name": "Vasco",
    "surname": "Regini",
    "type": "supplier",
    "username": "supplier1@ezwh.com",
    "password": "testpassword"
}
const user2 = {
    "name": "Mario",
    "surname": "Rossi",
    "type": "clerk",
    "username": "clerk1@ezwh.com",
    "password": "testpassword"
}
const user1 = {
    "name": "Diego",
    "surname": "Armando",
    "type": "Manager",
    "username": "manager1@ezwh.com",
    "password": "testpassword"
}



class DBInterface {
    sqlite = require('sqlite3');
    SKU_DBMNG = require("./modules/db/SKU_DBMNG");
    TEST_DESCRIPTOR_DBMNG = require("./modules/db/TEST_DESCRIPTOR_DBMNG");
    SKUITEM_DBMNG = require("./modules/db/SKUITEM_DBMNG");
    TEST_RESULT_DBMNG = require("./modules/db/TEST_RESULT_DBMNG");
    POSITION_DBMNG = require("./modules/db/POSITION_DBMNG");
    RESTOCK_ORDER_DBMNG = require("./modules/db/RESTOCK_ORDER_DBMNG");
    RETURN_ORDER_DBMNG = require("./modules/db/RETURN_ORDER_DBMNG");
    INTERNAL_ORDER_DBMNG = require("./modules/db/INTERNAL_ORDER_DBMNG");
    USER_DBMNG = require("./modules/db/USER_DBMNG");
    ITEM_DBMNG = require("./modules/db/ITEM_DBMNG");

    constructor(dbname) {
        /* DBMNG modules instances*/

        this.sku = new this.SKU_DBMNG(dbname);
        this.testDescriptor = new this.TEST_DESCRIPTOR_DBMNG(dbname);
        this.skuItem = new this.SKUITEM_DBMNG(dbname);
        this.testResult = new this.TEST_RESULT_DBMNG(dbname);
        this.position = new this.POSITION_DBMNG(dbname);
        this.restockOrder = new this.RESTOCK_ORDER_DBMNG(dbname);
        this.returnOrder = new this.RETURN_ORDER_DBMNG(dbname);
        this.user = new this.USER_DBMNG(dbname);
        this.item = new this.ITEM_DBMNG(dbname);
        this.internalOrder = new this.INTERNAL_ORDER_DBMNG(dbname);
    }

    async init() {
        await this.createTables();
    }


    createTables = async () => {
        await this.sku.createTable();
        await this.testDescriptor.createTable();
        await this.skuItem.createTable();
        await this.testResult.createTable();
        await this.position.createTable();
        await this.restockOrder.createTable();
        await this.returnOrder.createTable();
        await this.internalOrder.createTable();
        await this.user.createTable();
        await this.item.createTable();




        await this.createUser(user1)
        await this.createUser(user2)
        await this.createUser(user3)
        await this.createUser(user4)
        await this.createUser(user5)
        await this.createUser(user6)


    }

    /* SKU */
    async getAll_SKU() {
        const list = await this.sku.getAll_SKU()
        let td_l = []
        for (let i = 0; i < list.length; i++) {
            td_l = await this.testDescriptor.getTest_DescriptorsID_bySKU(list[i].id);
            list[i].testDescriptors = td_l.map(td => td.id);

        }

        return list
    }

    async getSKU_bySKUid(id) {
        const sku = await this.sku.getSKU(id)
        if (sku !== undefined) {
            let td_l = []
            td_l = await this.testDescriptor.getTest_DescriptorsID_bySKU(sku.id);
            sku.testDescriptors = td_l.map(td => td.id);
            return sku;
        } else {
            return sku;
        }
    }

    async createSKU(body) {
        const sku = new SKU(undefined, body.description, body.weight, body.volume, body.notes, undefined, body.availableQuantity, body.price);
        await this.sku.createSKU(sku)
    }

    async modifySKU(id, body) {
        const old_sku = await this.sku.getSKU(id);
        const posid = old_sku.position;

        if (posid !== undefined) {
            if (body.newWeight !== undefined) {
                const x = parseInt((body.newWeight || old_sku.weight) * (body.newAvailableQuantity || old_sku.availableQuantity))
                const y = parseInt((body.newVolume || old_sku.volume) * (body.newAvailableQuantity || old_sku.availableQuantity))

                const old_pos = await this.position.getPosition(posid);
                const new_pos = new Position(posid,
                    old_pos.aisleID,
                    old_pos.row,
                    old_pos.col,
                    old_pos.maxWeight,
                    old_pos.maxVolume,
                    x,
                    y);
                await this.position.modifyPosition(new_pos, posid);
            }
        }


        if (body.newTestDescriptors !== undefined && body.newTestDescriptors.length !== 0) {
            for (let td of body.newTestDescriptors) {
                const td_i = new Test_Descriptor(td.id,
                    td.name,
                    td.procedure_description,
                    id)
                await this.testDescriptor.createTestDecriptor(td_i);
            }
        }
        const new_sku = new SKU(id,
            body.newDescription || old_sku.description,
            body.newWeight || old_sku.weight,
            body.newVolume || old_sku.volume,
            body.newNotes || old_sku.notes,
            body.position || old_sku.position,
            body.newAvailableQuantity || old_sku.availableQuantity,
            body.newPrice || old_sku.price);
        await this.sku.modifySKU(new_sku);

    }

    async deleteSKU(id) {
        await this.sku.deleteSKU(parseInt(id));
        await this.testDescriptor.deleteTestDescriptorsBySKUId(id);
    }

    /*TEST DESCRIPTOR*/
    async getAll_TestDescriptors() {
        const list = await this.testDescriptor.getAll_TestDescriptors();
        return list
    }

    async getTestDescriptors_byId(id) {
        const td = await this.testDescriptor.getTestDescriptors_byId(id)
        return td
    }
    async createTestDescriptor(body) {
        const td = new Test_Descriptor(-1, body.name, body.procedureDescription, parseInt(body.idSKU));
        await this.testDescriptor.createTestDescriptor(td)
    }

    async modifyTestDecriptor(body, id) {
        const old_td = await this.testDescriptor.getTestDescriptors_byId(id);
        const new_td = new Test_Descriptor(
            old_td.id,
            body.newName || old_td.name,
            body.newProcedureDescription || old_td.procedureDescription,
            parseInt(body.newIdSKU) || old_td.idSKU
        );
        await this.testDescriptor.modifyTestDescriptor(new_td);
    }

    async deleteTestDescriptor(id) {
        await this.testDescriptor.deleteTestDescriptor(id)
    }

    /* SKUITEM */
    async getAll_SKUItems() {
        const list = await this.skuItem.getAll_SKUItems();

        return list;
    }

    async getSKUItems_bySKUid(skuid) {
        const list = await this.skuItem.getSKUItems_bySKUid(skuid);

        const parsed_list = list.map(si => {
            return {
                "RFID": si.RFID,
                "SKUId": si.SKUId,
                "DateOfStock": si.DateOfStock
            }
        });


        return parsed_list
    }

    async getSKUItem_byRFID(rfid) {
        const sku_item = await this.skuItem.getSKUItem_byRFID(rfid);
        return sku_item;
    }

    async createSKUItem(body) {

        const skui = new SKU_Item(body.RFID,
            body.SKUId,
            0,
            body.DateOfStock);
        await this.skuItem.createSKUItem(skui);
    }


    async modifySKU_Item(body, id) {
        const old_skui = await this.skuItem.getSKUItem_byRFID(id);
        const new_skui = new SKU_Item(
            body.newRFID || old_skui.RFID,
            old_skui.SKUId,
            body.newAvailable || old_skui.Available,
            body.newDateOfStock || old_skui.DateOfStock
        )

        await this.skuItem.modifySKU_Item(new_skui, id)
    }

    async deleteSKUItem(rfid) {
        await this.skuItem.deleteSKUItem(rfid);
        const tr_l = await this.testResult.getAllTestResults_byRFID(rfid);
        for (let tr of tr_l) {
            await this.testResult.deleteTestResult(tr.id)
        }

    }

    /*TEST RESULTS*/
    async getAllTestResults_byRFID(rfid) {
        const list = await this.testResult.getAllTestResults_byRFID(rfid);
        const parsed_list = list.map(tr => {
            tr.id,
                tr.idTestDescriptor,
                tr.date,
                tr.result
        })
        return list
    }

    async getTestResult_byId(id, rfid) {
        const tr = await this.testResult.getTestResult_byId(id)
        const skui = await this.skuItem.getSKUItem_byRFID(rfid);
        if (skui !== undefined && tr !== undefined && skui.RFID === rfid) {
            const parsed_tr = {
                "id": tr.id,
                "idTestDescriptor": tr.idTestDescriptor,
                "Date": tr.Date,
                "Result": tr.Result
            }
            return parsed_tr;
        } else {
            return undefined
        }
    }

    async createTestResult(body) {
        await this.testResult.createTestResult(body);
    }

    async modifyTestResult(body, id) {
        const old_tr = await this.testResult.getTestResult_byId(id);
        const new_tr = new Test_Result(
            old_tr.id,
            old_tr.rfid,
            body.newIdTestDescriptor,
            body.newDate,
            body.newResult
        )
        await this.testResult.modifyTestResult(new_tr)
    }

    async deleteTestResult(id) {
        await this.testResult.deleteTestResult(id)
    }

    /* POSITION */
    async getAll_Positions() {
        const list = await this.position.getAll_Positions();
        return list;
    }

    async getPosition(id) {
        const pos = await this.position.getPosition(id);
        return pos;
    }

    async createPosition(body) {
        const pos = new Position(body.positionID,
            body.aisleID,
            body.row,
            body.col,
            body.maxWeight,
            body.maxVolume,
            0,
            0);
        await this.position.createPosition(pos)
    }

    async modifyPosition(body, oldid) {

        if (body.newPositionID !== undefined) {
            const posid = body.newPositionID;
            const p = new Position(posid,
                posid.slice(0, 4),
                posid.slice(4, 8),
                posid.slice(8, 12)
            );

            await this.position.modifyPositionID(p, oldid);

        } else {
            const posid = body.newAisleID + body.newRow + body.newCol
            const p = new Position(
                posid,
                body.newAisleID,
                body.newRow,
                body.newCol,
                body.newMaxWeight,
                body.newMaxVolume,
                body.newOccupiedWeight,
                body.newOccupiedVolume)
            await this.position.modifyPosition(p, oldid);
        }
        const sku = await this.sku.getSKU_byPosition(parseInt(oldid));
        if (sku !== undefined) {
            const new_sku = new SKU(sku.id, sku.description, sku.weight, sku.volume, sku.notes, posid, sku.availableQuantity, sku.price);
            await this.sku.modifySKU(new_sku);
        }



    }

    async deletePosition(id) {
        await this.position.deletePosition(id);

    }

    /* RESTOCK ORDERS */
    async getAll_RestockOrders() {
        const list = await this.restockOrder.getAll_RestockOrders();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const products = await this.restockOrder.getProducts(list[i].id);

                for (let j = 0; j < products.length; j++) {

                    const product = {
                        "SKUId": products[j].id,
                        "itemId": products[j].itemId,
                        "description": products[j].description,
                        "price": products[j].price,
                        "qty": products[j].qty
                    }
                    list[i].products[j] = product;
                }
                if (!(list[i].state === "ISSUED")) {
                    list[i].transportNote = { "deliveryDate": list[i].transportNote }
                }
                if (!(list[i].state === "ISSUED" || list[i].state === "DELIVERY")) {
                    const skui_list = await this.restockOrder.getSKUItem_RS(list[i].id);
                    list[i].skuItems = skui_list;
                }
            }
        }
        return list
    }

    async getAll_Issued_RestockOrders() {
        const list = await this.restockOrder.getAll_Issued_RestockOrders();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const products = await this.restockOrder.getProducts(list[i].id);
                for (let j = 0; j < products.length; j++) {
                    const product = {
                        "SKUId": products[j].id,
                        "itemId": products[j].itemId,
                        "description": products[j].description,
                        "price": products[j].price,
                        "qty": products[j].qty
                    }
                    list[i].products[j] = product;
                }
            }
            return list;
        }
    }


    async getRestockOrder_byId(id) {
        const ro = await this.restockOrder.getRestockOrder_byId(id);

        if (ro !== undefined) {
            const products = await this.restockOrder.getProducts(ro.id);
            for (let j = 0; j < products.length; j++) {
                const product = {
                    "SKUId": products[j].id,
                    "itemId": products[j].itemId,
                    "description": products[j].description,
                    "price": products[j].price,
                    "qty": products[j].qty
                }
                ro.products[j] = product;
            }
            if (!(ro.state === "ISSUED")) {
                ro.transportNote = { "deliveryDate": ro.transportNote }
            }
            if (!(ro.state === "ISSUED" || ro.state === "DELIVERY")) {
                const skui_list = await this.restockOrder.getSKUItem_RS(ro.id);
                ro.skuItems = skui_list;
            }
        }
        return ro;
    }

    async getSKUItems_RestockOrder_byId(id) {
        const list = await this.restockOrder.getSKUItem_RS(id);
        return list;
    }

    async createRestockOrder(body) {

        const ro = new Restock_Order(-1,
            body.supplierId,
            'ISSUED',
            body.issueDate,
        )
        await this.restockOrder.createRestockOrder(ro);
        const ro_id = await this.restockOrder.getLastRS();
        for (let p of body.products) {
            const sku = await this.sku.getSKU(p.SKUId);
            await this.restockOrder.createProduct(ro_id, sku, p.qty, body.itemId);
        }

    }

    async modifyState_RestockOrder(id, newState) {
        await this.restockOrder.modifyState_RestockOrder(id, newState);
    }

    async addSkuItems_toRestockOrder(skuItems, id) {

        for (let skui of skuItems) {
            const date = dayjs().format("YYYY/MM/DD HH:mm");
            // const skuitem = new SKU_Item(skui.rfid, skui.SKUId, 1, date);
            // await this.skuItem.createSKUItem(skuitem)

            await this.restockOrder.addSkuItems_toRestockOrder(skui.SKUId, id, skui.rfid, skui.itemId);
        }

    }

    async addTransportNote_toRestockOrder(transportNote, id) {
        await this.restockOrder.addTransportNote_toRestockOrder(transportNote, id)

    }

    async getSKUItemsToBeReturned_byRestockOrderID(id) {
        const ro_list = await this.returnOrder.getReturnOrder_byRSId(id)
        const list = [];
        for (let ro of ro_list) {
            const skuis = await this.returnOrder.getReturnOrderProducts(ro.id);
            for (let skui of skuis) {
                list.push({
                    "RFID": skui.RFID,
                    "SKUId": skui.SKUId,
                    "itemId": skuis.itemId
                })
            }
        }
        return list;
    }

    async deleteRestockOrder(id) {
        await this.restockOrder.deleteRestockOrder(id);
        await this.restockOrder.deleteProducts_byRS(id);
        await this.restockOrder.deleteSKUItems_byRS(id);
    }

    /*RETURN ORDER*/
    async getAll_ReturnOrders() {
        const list = await this.returnOrder.getAll_ReturnOrders();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const products = await this.returnOrder.getReturnOrderProducts(list[i].restockOrderId);
                for (let j = 0; j < products.length; j++) {

                    const sku = await this.sku.getSKU(products[j].SKUId);

                    const product = {
                        "SKUId": sku.id,
                        "itemId": products[j].itemId,
                        "description": sku.description,
                        "price": sku.price,
                        "RFID": products[j].RFID

                    }
                    list[i].products[j] = product;
                }

            }
            return list;
        }
    }

    async getReturnOrder_byId(id) {
        const ro = await this.returnOrder.getReturnOrder_byId(id);

        const products = await this.returnOrder.getReturnOrderProducts(ro.id);
        for (let j = 0; j < products.length; j++) {
            const sku = await this.sku.getSKU(products[j].SKUId);

            const product = {
                "SKUId": sku.id,
                "itemId": products[j].itemId,
                "description": sku.description,
                "price": sku.price,
                "RFID": products[j].RFID
            }
            ro.products[j] = product;
        }

        return ro;
    }

    async createReturnOrder(body) {

        const ro = new Return_Order(-1,
            body.returnDate,
            body.restockOrderId
        )

        await this.returnOrder.createReturnOrder(ro);
        const ro_id = await this.returnOrder.getLastRO();

        for (let p of body.products) {
            await this.returnOrder.createReturnProduct(ro_id.ID, p);
        }

    }

    async deleteReturnOrder(id) {
        await this.returnOrder.deleteReturnOrder(id);
        await this.returnOrder.deleteProducts_byRO(id);
        return true;
    }

    /* User */
    async getAllUsers() {
        let list = await this.user.getAllUsers();
        return list
    }

    async getAllUsers_butManagers() {
        let list = await this.user.getAllUsers_butManagers();
        return list
    }

    async getSuppliers() {
        const list = await this.user.getSuppliers();
        return list
    }

    async getUser(mail, type) {

        const user = await this.user.getUser(mail, type);


        return user[0];
    }

    async createUser(body) {
        const hash = await bcrypt.hash(body.password, 10);
        /*  Where 10 is the Salt. The more salt is
            big, the more the function is slower    */

        const user = new User(-1,
            body.name,
            body.surname,
            body.username,
            body.type,
            hash
        )

        await this.user.createUser(user);
    }

    async checkUser(body, type) {

        /*  Where 10 is the Salt. The more salt is
            big, the more the function is slower    */

        const user = new User(-1,
            undefined,
            undefined,
            body.username,
            type,
            body.password,
        )

        const check_user = await this.user.checkUser(user);

        if (check_user) {
            const pw = await bcrypt.compare(body.password, check_user[0].password);
            if (pw) {
                const user_checked = {
                    "id": check_user[0].id,
                    "name": check_user[0].name,
                    "surname": check_user[0].surname
                }

                return user_checked;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }

    }

    async checkMail(mail) {
        var mailformat = /^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/;
        var mailformatS = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (mail.match(mailformatS)) {
            return true;
        } else {
            return false;
        }
    }

    async modifyRightsUser(username, body) {
        const err = await this.user.updateUser(username, body);
        if (err) {
            return err;
        } else {
            return undefined;
        }
    }

    async deleteUser(username, type) {
        const err = await this.user.deleteUser(username, type);
        if (err) {
            return err;
        } else {
            return undefined;
        }
    }

    /* Item */
    async getAllItem() {
        const list = await this.item.getAll_Item();
        return list
    }

    async getItem(item_id, suppid) {
        const item = await this.item.getItem(item_id, suppid);
        return item;
    }

    async getItemBySKUid(skuid, suppid) {
        const item = await this.item.getItemBySKUid(skuid, suppid);
        return item;
    }

    async createItem(body) {
        const item = new Item(
            body.id,
            body.description,
            body.price,
            body.SKUId,
            body.supplierId
        )
        await this.item.createItem(item);
    }

    async updateItem(id, suppid, body) {
        const err = await this.item.modifyItem(id, suppid, body);
        if (err) {
            return err;
        } else {
            return undefined;
        }
    }

    async deleteItem(id, suppid) {
        const err = await this.item.deleteItem(id, suppid);
        if (err) {
            return err;
        } else {
            return undefined;
        }
    }

    /* API for Internal Order */

    async getAll_InternalOrders() {
        const list = await this.internalOrder.getAll_InternalOrders();

        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                if (list[i].state === 'COMPLETED') {
                    const products_completed = await this.internalOrder.getProducts_CompletedIO(list[i].id);
                    for (let j = 0; j < products_completed.length; j++) {

                        const product = {
                            "SKUId": products_completed[j].SKU_ID,
                            "description": products_completed[j].DESCRIPTION,
                            "price": products_completed[j].PRICE,
                            "RFID": products_completed[j].RFID,
                        }
                        list[i].products[j] = product;
                    }
                } else {
                    const products = await this.internalOrder.getProducts_IO(list[i].id)
                    for (let j = 0; j < products.length; j++) {
                        const product = {
                            "SKUId": products[j].SKU_ID,
                            "description": products[j].DESCRIPTION,
                            "price": products[j].PRICE,
                            "qty": products[j].QTY,
                        }
                        list[i].products[j] = product;
                    }
                }



            }
        }
        return list;
    }


    async getIssued_InternalOrders() {
        const list = await this.internalOrder.getIssued_InternalOrders();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const products = await this.internalOrder.getProducts_IO(list[i].id)
                for (let j = 0; j < products.length; j++) {

                    const product = {
                        "SKUId": products[j].SKU_ID,
                        "description": products[j].DESCRIPTION,
                        "price": products[j].PRICE,
                        "qty": products[j].QTY,
                    }
                    list[i].products[j] = product;
                }
            }
            return list;
        }

    }

    async getAccepted_InternalOrders() {
        const list = await this.internalOrder.getAccepted_InternalOrders();
        if (list.length > 0) {
            for (let i = 0; i < list.length; i++) {
                const products = await this.internalOrder.getProducts_IO(list[i].id)
                for (let j = 0; j < products.length; j++) {

                    const product = {
                        "SKUId": products[j].SKU_ID,
                        "description": products[j].DESCRIPTION,
                        "price": products[j].PRICE,
                        "qty": products[j].QTY,
                    }
                    list[i].products[j] = product;
                }
            }
            return list;
        }
    }

    async getInternalOrder_byId(id) {
        const io = await this.internalOrder.getInternalOrder_byId(id);

        if (io.state === 'COMPLETED') {
            const products_completed = await this.internalOrder.getProducts_CompletedIO(io.id);
            for (let j = 0; j < products_completed.length; j++) {

                const product = {
                    "SKUId": products_completed[j].SKU_ID,
                    "description": products_completed[j].DESCRIPTION,
                    "price": products_completed[j].PRICE,
                    "RFID": products_completed[j].RFID,
                }
                io.products[j] = product;
            }
        } else {
            const products = await this.internalOrder.getProducts_IO(io.id)
            for (let j = 0; j < products.length; j++) {

                const product = {
                    "SKUId": products[j].SKU_ID,
                    "description": products[j].DESCRIPTION,
                    "price": products[j].PRICE,
                    "qty": products[j].QTY,
                }
                io.products[j] = product;
            }
        }

        return io;

    }

    async createInternalOrder(body) {

        const io = new Internal_Order(-1,
            body.issueDate,
            'ISSUED',
            body.customerId
        )
        await this.internalOrder.createInternalOrder(io);
        const io_id = await this.internalOrder.getLastIO();

        for (let i = 0; i < body.products.length; i++) {
            await this.internalOrder.createProducts_IO(io_id, body.products[i]);
        }
    }

    async modifyState_InternalOrder(id, body) {
        if (body.newState === 'COMPLETED') {


            if (body.products) {
                for (let i = 0; i < body.products.length; i++) {

                    const sku = await this.internalOrder.getProduct_IO(id);

                    await this.internalOrder.createSkuItems_inInternalOrder(id, sku, body.products[i].RFID);
                }
            }

        }

        await this.internalOrder.modifyState_InternalOrder(id, body);
    }



    async deleteInternalOrder(id) {
        await this.internalOrder.deleteInternalOrder(id);
        await this.internalOrder.deleteProducts_IO(id);
        await this.internalOrder.deleteSKUItems_IO(id);
    }






}

module.exports = DBInterface;