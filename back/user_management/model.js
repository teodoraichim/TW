const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');

hashPassword = function (password) {
    let hash = bcrypt.hashSync(password, 10);
    return hash;
}


function checkUsername(name) {
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
            console.log("checkUsername" + rows[0].c);
            if (rows[0].c == 0) resolve(false);
            else resolve(true);
        });
    });

}
function checkEmail(email) {
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
            console.log("check email:" + rows[0].c);
            if (rows[0].c == 0) resolve(false);
            else resolve(true);
        });
    });

}
function addUser(name, email, password) {
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

function generateCode(email) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        var randomString = require('randomstring');

        module.exports.getId(email).then(function (id) {

            var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
            con.connect(function (err) {
                if (err) return reject(err);
                console.log("Connected!");
            });

            let code = randomString.generate(20);
            console.log("codes:" + id + " " + code);

            con.query('insert into codes(userId,code) values(?,?)', [id, code], function (err, rows, fields) {
                if (err) return resolve(false);
                con.end();

                sendMail(email, code).then(function (bool) {
                    if (bool) resolve(true);
                    else resolve(false);
                }).catch((err) => setImmediate(() => { console.log(err); reject(-1); }));
            });

        });


    });

}
module.exports.validateCode = function (mail, code) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        module.exports.getId(mail).then(function (userId) {
            console.log("user id:" + userId);
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
        })

    });

}
module.exports.activateAccount = function (mail) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');


        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        con.query('update users set status=1 where email=?', [mail], function (err, rows, fields) {
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

        con.query('select password from users where username=? and status=1', [user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            if (rows[0] == null) resolve(false);
            let hash = toString(rows[0]);
            if (!bcrypt.compareSync(password, hash)) resolve(false);
            resolve(true);

        });

    })
}
module.exports.updatePassword = function (email, password) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        let hash = hashPassword(password);
        con.query('update users set password=? where email=?', [hash, email], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();

            resolve(true);

        })

    }).catch((err) => setImmediate(() => { console.log(err); }));
}
module.exports.getId = function (username) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        console.log("get id:" + username);
        var con = mysql.createConnection({ host: 'localhost', user: 'test', password: '', database: 'manage_users' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('select userId from users where username=? or email=?', [username, username], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();

            resolve(rows[0].userId);

        });

    })
}

function sendMail(mail, code) {
    return new Promise(function (resolve, reject) {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'fiicatalog.verify@gmail.com',
                pass: '1rtU7AIC'
            }
        })

        var mailOptions = {
            from: 'fiicatalog.verify@gmail.com',
            to: mail,
            subject: 'Validation code',
            text: 'Use this code: ' + code + ' to validate your account!'
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                reject(false);
            } else {
                resolve(true);
                console.log('Email sent: ' + info.response);
            }
        });
    });

}
module.exports.register = function (name, pass, email) {
    return new Promise(function (resolve, reject) {
        console.log("register " + name + " " + email + " " + pass);

        checkEmail(email).then(function (bool) {
            if (bool) reject('account already exists');
            else {

                checkUsername(name).then(function (bool1) {
                    if (bool1) reject('username already taken');
                    else {
                        addUser(name, email, pass).then(function (bool2) {
                            if (bool2) {
                                generateCode(email).then(function (bool3) {
                                    console.log("sent email generated code " + bool3);
                                    if (bool3) resolve('added succesfully');
                                    else reject("cannot resolve");
                                }).catch((err) => setImmediate(() => { console.log(err); reject(err); }));
                            }
                        }).catch((err) => setImmediate(() => { console.log(err); reject(err); }));
                    }
                }).catch((err) => setImmediate(() => { console.log(err); reject(err); }));
            }
        });
    })
}
module.exports.changePassword = function (email) {
    return new Promise(function (resolve, reject) {
        checkEmail(email).then(function (bool) {
            if (bool) {

                generateCode(email).then(function (bool1) {
                    console.log("code generated");
                    if (bool1) resolve(true);
                    resolve(false);
                });
            }
        })


    })
}
module.exports.changePassValidate = function (email, code, password) {
    return new Promise(function (resolve, reject) {


        module.exports.validateCode(email, code).then(function (bool) {
            if (bool) {
                module.exports.updatePassword(email,password).then(function (bool1) {
                    resolve(bool1);
                });
            }
            else resolve(false);
        });
    });
}


