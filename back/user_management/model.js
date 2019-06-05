const bcrypt = require('bcrypt');




module.exports.register = function (user_name, password,email,date) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
        
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        let hash=bcrypt.hashSync(password,10);
        
        con.query('insert into users(username,email,password,date) values (?,?,?,?)', [user_name,email,hash,date], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            resolve("added succesfully");

        });

    });
}
module.exports.login = function (user_name, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        
        con.query('select password form users where username=?', [user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if(rows[0]==null) resolve("user inexistent");
            let hash=toString(rows);
            if(!bcrypt.compareSync(password,hash)) resolve("incorect password");
            resolve("logged in succesfully");

        });

    });
}
module.exports.changePassword = function (user_name, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        let hash=bcrypt.hashSync(password,10);
        con.query('update users set password=? where username=?', [hash,user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            resolve("changed succesfully");

        });

    });
}
module.exports.getId = function (user_name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        
        con.query('select user_id from users where username=?', [user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            resolve(rows);

        });

    });
}