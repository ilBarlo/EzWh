const USERDBMNG = require('../modules/db/USER_DBMNG');
const user_dao = new USERDBMNG("db.sqlite");
const USER = require('../modules/backend/User');

describe('testDao', () => {
    beforeEach(async () => {
        await user_dao.createTable();
        await user_dao.deleteData();
    });

    test('delete table', async () => {
        var res = await user_dao.getAllUsers();
        expect(res.length).toStrictEqual(0);
    });

    testNewuser('Francesco', 'Barletta', 'manager', 'f.barletta14@gmail.com', 'testpassword');
    testNewuser('Mario', 'Rossi', 'supplier', 'mariorossi@gmail.com', 'testpassword');
    
    testSupplierUser('Francesco', 'Barletta', 'supplier', 'f.barletta14@gmail.com', 'testpassword');

    testModifyAndDeleteUser('supplier', 'pippopluto@libero.it', 'manager');
});

function testNewuser(name, surname, type, email, password){
    test('create a new user', async() => {
        const user = new USER(-1, name, surname, type, email, password);
        var err = await user_dao.createUser(user);
        
        var res = await user_dao.getAllUsers();
        expect(res.length).toStrictEqual(1);

        
        res = await user_dao.getUser(email, type);
        expect(res.length).toStrictEqual(1);

        const checkUser = await user_dao.checkUser(user);
        for (let check of checkUser){
            expect(check.name).toStrictEqual(name);
            expect(check.surname).toStrictEqual(surname);
            expect(check.type).toStrictEqual(type);
            expect(check.email).toStrictEqual(email);
            expect(check.password).toStrictEqual(password);    
        }

    });

}

function testSupplierUser(name, surname, type, email, password){
    test('test supplier user', async() => {
        const user = new USER(-1, name, surname, type, email, password);
        var err = await user_dao.createUser(user);
        
        var res = await user_dao.getAllUsers();
        expect(res.length).toStrictEqual(1);

        const checkUser = await user_dao.getSuppliers();
        for (let check of checkUser){
            expect(check.NAME).toStrictEqual(name);
            expect(check.SURNAME).toStrictEqual(surname);
            expect(check.EMAIL).toStrictEqual(email);   
        }

    });

}

function testModifyAndDeleteUser(newType, email, oldType){
    test('modify and delete user', async() => {
        const old_user = new USER(-1, 'Giovanni', 'Russo', 'manager', 'pippopluto@libero.it', 'cardolini');
        var err = await user_dao.createUser(old_user);
        
        var res = await user_dao.getAllUsers();
        expect(res.length).toStrictEqual(1);

        const body = {
            oldType: oldType,
            newType: newType
        }
        
        
        await user_dao.updateUser(email, body)
        
        var checkUser = await user_dao.getUser(email, body.newType);
        
        for (let check of checkUser){
            expect(check.type).toStrictEqual(body.newType);
            expect(check.email).toStrictEqual(email);    
        }

        await user_dao.deleteUser(email, body.newType);
    });

}