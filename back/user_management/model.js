const bcrypt = require('bcrypt');
var nodemailer = require('nodemailer');




module.exports.register = function (user_name, password,email,date) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'dba', password: 'sql', database: 'movies' });
        
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        if(checkMail(email)) resolve("account already exists!");
        if(checkUsername(user_name)) resolve("username is already used");
        else{

        let hash=bcrypt.hashSync(password,10);

        let code = crypto.randomBytes(20).toString('hex');
        sendMail(email,code);
        con.query('insert into users(username,email,password) values (?,?,?)', [user_name,email,hash,date,code], function (err, rows, fields) {
            if (err) return reject(err);
            
          });  
        let id = getId(user_name);
        con.query('insert into keys(userId,code) values (?,?)',[id,code],function(err,rows,fields){
            if(err) return reject(err);
            con.end();
        })
        
            resolve("added succesfully");

        
    }

        

    });
}

module.exports.registerValidate = function(userId,code){
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        conn.query('select count (*) as c from keys where idUser=? and code=?',[userId,code],function(err,rows,fields){
            if(err) return reject(err);
            con.end();
            if (rows[0].c == 0) resolve(false);
            else resolve(true);
        })


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
module.exports.getId = function (user) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        
        con.query('select user_id from users where username=? or email=>', [user,user], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            resolve(rows);

        });

    });
}
module.exports.checkUsername = function (user_name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        
        con.query('select count (*) as count from users where username=?', [user_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            if(rows.c!=0)resolve('Username already exists');

        });

    });
}
module.exports.checkMail = function (mail) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
       
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        
        con.query('select count (*) as count from users where mail=?', [mail], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            
            if(rows.c!=0) resolve(true);

        });

    });

    
}
module.exports.sendMail = function (mail,code) {
    return new Promise(function(resolve,reject){
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
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      })
    });

    }
    module.exports.addCode = function(userId){

        return new Promise(function (resolve, reject) {
            var mysql = require('mysql');
    
            var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'user_management' });
           
            con.connect(function (err) {
                if (err) return reject(err);
                console.log("Connected!");
            });
            
            
            con.query('insert into keys(userId,code) values (?,?)', [userId,code], function (err, rows, fields) {
                if (err) return reject(err);
                con.end();
                
                return resolve('added');
    
            });
    
        });

    }