'use strict';

class User {
    constructor(id, name, surname, email, type, password) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.type = type
        this.email = email;
        this.password = password;

    }
}

module.exports = User;
