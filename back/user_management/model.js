const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

hashPassword = function (password) {
    let hash = bcrypt.hashSync(password, 10);
    return hash;
}


module.exports.checkUsername = function (name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select count (*) as c from users where username=?', [name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if (rows[0].c == 0) resolve(false);
            else resolve(true);
        });
    });

}
module.exports.checkEmail = function (email) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select count (*) as c from users where email=?', [email], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if (rows[0].c == 0) resolve(false);
            else resolve(true);
        });
    });

}
module.exports.addUser = function (name, email, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        let hash = hashPassword(password);

        con.query('insert into users(username,email,password) values (?,?,?)', [name, email, hash], function (err, rows, fields) {

            if (err) return reject(err);
            con.end();
            resolve(true);

        })

    })
}

module.exports.generateCode = function (email) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        var randomString = require('randomString');

        let id=getId(email);
    

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        let code = randomString.generate(20);

        con.query('insert into codes(userId,code) values(?,?)', [id, code], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            sendMail(email,code,function(bool){
                if(bool) resolve(true);
                else resolve(false);
            })
        });
        

    });

}
module.exports.validateCode = function (userId, code) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');


        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select count (*) as c from codes where userId=? and code=?', [userId, code], function (err, rows, fields) {
            if (err) return reject(err);

            if (rows[0].c == 1) {
                con.query('delete from codes where userId=? and code=?', [userId, code], function (err, rows, fields) {
                    if (err) return (err);
                    con.end();
                });

                resolve(true);
            }
            else resolve(false);

        });
    });

}
module.exports.activateAccount = function (userId) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');


        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        con.query('update users set status=1 where userId=?', [userId], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            resolve('account activated');
        });
    })
}
module.exports.checkStatus = function (username) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select status from users where username=?', [username], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if (rows[0].status == 1) resolve(true);
            else resolve(false);
        })

    })
}


module.exports.login = function (user_name, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select password form users where username=? and status=1', [user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if (rows[0] == null) resolve(false);
            let hash = toString(rows);
            if (!bcrypt.compareSync(password, hash)) resolve(false);
            resolve(true);

        });

    });
}
module.exports.updatePassword = function (user_name, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        let hash = hashPassword(password);
        con.query('update users set password=? where username=?', [hash, user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();

            resolve("changed succesfully");

        });

    });
}
module.exports.getId = function (user) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select userId from users where username=? or email=>', [user, user], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();

            resolve(rows);

        });

    });
}

module.exports.sendMail = function (mail, code) {
    return new Promise(function (resolve, reject) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'web.db.admi@gmail.com',
                pass: 'UPNP2019'
            }
        })

        var mailOptions = {
            from: 'web.db/mail@gmail.com',
            to: mail,
            subject: 'Validation code',
            text: 'Use this code: ' + code + ' to validate your account!'
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        }).catch((err) => setImmediate(() => { send500Response(response); console.log(err); }));
    });

}
module.exports.register = function(nume,email,pass){
    return new Promise(function(resolve,reject){

        checkEmail(email,function(bool){
            if(bool) resolve('account already exists');
            else{
                checkUsername(name,function(bool1){
                    if(bool1) resolve('username already taken');
                    else {
                        addUser(nume,email,pass,function(bool2){
                            if(bool2){
                                generateCode(nume,email,function(bool3){
                                    if(bool3) resolve('added succesfully');
                                })
                            }
                        });
                    }
                })
            }
        })
    })
}
module.exports.changePassword = function(email){
    return new Promise(function(resolve, reject){
        checkEmail(email,function(bool){
            if(bool) {
                getId(email,function(id){
                    generateCode(id,email,function(bool1){
                        resolve(bool1);
                    })
                })
            }
        })


    })
}
module.exports.changePassValidate = function(email,code,password){
    return new Promise(function(resolve,reject){
        getId(email,function(id){
            validateCode(id,code,function(bool){
                if(bool){
                    updatePassword(password,function(bool1){
                        resolve(bool1);
                    });
                }
                 else resolve(false);
                
            });
        });
    });
}


