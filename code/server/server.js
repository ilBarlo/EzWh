'use strict';
const express = require('express');
// init express
const app = new express();
const port = 3001;

app.use(express.json());

const DBinterface = require("./DBInterface");

const SKU_API = require("./modules/apis/SKU_API");
const TEST_DESCRIPTOR_API = require("./modules/apis/TEST_DESCRIPTOR_API");
const SKUITEM_API = require("./modules/apis/SKUITEM_API");
const TEST_RESULT_API = require("./modules/apis/TEST_RESULT_API");
const POSITION_API = require("./modules/apis/POSITION_API");
const RESTOCK_ORDER_API = require("./modules/apis/RESTOCK_ORDER_API");
const RETURN_ORDER_API = require("./modules/apis/RETURN_ORDER_API");
const INTERNAL_ORDER_API = require("./modules/apis/INTERNAL_ORDER_API");
const USER_API = require("./modules/apis/USER_API");
const ITEM_API = require("./modules/apis/ITEM_API");




async function init() {
    const EZWH = new DBinterface("db.sqlite");

    const sku_apis = new SKU_API(app, EZWH);
    const td_apis = new TEST_DESCRIPTOR_API(app, EZWH);
    const skui_apis = new SKUITEM_API(app, EZWH);
    const tr_apis = new TEST_RESULT_API(app, EZWH);
    const pos_apis = new POSITION_API(app, EZWH);
    const rs_apis = new RESTOCK_ORDER_API(app, EZWH);
    const rt_apis = new RETURN_ORDER_API(app, EZWH);
    const io_apis = new INTERNAL_ORDER_API(app, EZWH);
    const user_apis = new USER_API(app, EZWH);
    const item_apis = new ITEM_API(app, EZWH);


    console.log("creating handlers")
    sku_apis.create_handlers();
    td_apis.create_handlers();
    skui_apis.create_handlers();
    tr_apis.create_handlers();
    pos_apis.create_handlers();
    rs_apis.create_handlers();
    rt_apis.create_handlers();
    io_apis.create_handlers();
    user_apis.create_handlers();
    item_apis.create_handlers();

    /* Uncomment if db.sqlite is not defined: create all tables and hardcoded accounts from scratch*/
    //await EZWH.init();

}

init()

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});







module.exports = app;