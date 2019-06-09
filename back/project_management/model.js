//GET from table
//returns a list of projects for which the user is collaborator
module.exports.getProjectList = function (user_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json = {};
        con.query('select projects.project_name,projects.creator from projects inner join colabs on projects.project_id=colabs.project_id where colabs.user_id=?', [user_id], function (err, rows, fields) {
            if (err) return reject(err);
            json['projects'] = rows;
            con.end();
            resolve(JSON.stringify(json));

        });

    });

}
module.exports.getProjectId = function (project_name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        console.log('user_id:' + user_id + ";project_id:" + project_id);
        con.query('select project_id from  projects where project_name=?', [project_name], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            console.log(rows[0].project_id);
            if (rows[0].c == 0) resolve(false);
            else resolve(true);

        });

    });
}
//returns true if user_id is a colaborator of project_id;false otherwise
module.exports.isColab = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        console.log('user_id:' + user_id + ";project_id:" + project_id);
        con.query('select count(*) as c from colabs where project_id=? and user_id=?', [project_id, user_id], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            console.log(rows[0].c);
            if (rows[0].c == 0) resolve(false);
            else resolve(true);

        });

    });
}
//returns information about a certain project
function getProjectInfo(user_id, project_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json = {};
        con.query('select projects.project_id,projects.project_name,projects.creator,projects.database_id,projects.username,projects.password from projects inner join colabs on projects.project_id=colabs.project_id where colabs.user_id=? and colabs.project_id=?', [user_id, project_id], function (err, rows, fields) {
            if (err) return reject(err);
            json['info'] = rows;
            con.end();
            // JSON.stringify(json)
            resolve(rows);

        });

    });
}
//returns the list of collaborators of a project_id
function getCollabs(project_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json = {};

        con.query('select colabs.user_id from colabs where project_id=?', [project_id], function (err, rows, fields) {
            if (err) return reject(err);
            json['colabs'] = rows;
            con.end();
            console.log(json['colabs']);
            resolve(rows);

        });

    });
}
//returns full information about a certain project
module.exports.getProject = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        var json = {};
        getCollabs(project_id).then(function (resp) {
            json['colabs'] = resp;
            getProjectInfo(user_id, project_id).then(function (resp2) {
                json['info'] = resp2; resolve(JSON.stringify(json));
            }).catch((err) => setImmediate(() => { reject(err);  }));
        }).catch((err) => setImmediate(() => { reject(err);  }));
    });
}
//returns table schema 
module.exports.getTableSchema = function (user_id, project_id, database_id, table_name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'db' + database_id });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json = {};
        con.query("describe ?", [table_name], function (err, rows, fields) {
            if (err) return reject(err);
            json['result'] = rows;
            con.end();
            resolve(JSON.stringify(json));

        });

    });
}
//returns all the entries from a table
module.exports.getTableValues = function (user_id, database_id, table_name) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        model.exports.isColab(user_id, project_id).then(function (bool) {
            if (bool) {
                var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'db' + database_id });
                var result_json;
                con.connect(function (err) {
                    if (err) return reject(err);
                    console.log("Connected!");
                });
                var json = {};
                con.query('select * from table ?', [table_name], function (err, rows, fields) {
                    if (err) return reject(err);
                    json['rows'] = rows;
                    con.end();
                    resolve(JSON.stringify(json));

                });
            }
            else
                reject('no authorization');
        });

    });
}
//return number of projects
function getNumProjects() {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        con.query('select count(*) as c from projects', function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            console.log(rows[0].c);
            resolve(rows[0].c);
        });

    });
}
//POST
//add a new entry into project table
function addIntoProjects(proj_id, proj_name, user_id, database_id, dbUsername, dbPassword) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        con.query('insert into projects (project_id,project_name,creator,database_id,username,password) VALUES(?,?,?,?,?,?)', [proj_id, proj_name, user_id, database_id, dbUsername, dbPassword], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            resolve('Added successfuly!');

        });

    });
}
//add a collaboration
module.exports.addIntoColabs = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        var result_json;
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });

        con.query('insert into colabs(user_id,project_id) VALUES(?,?)', [user_id, project_id], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            resolve('Added successfuly!');

        });

    });
}

function createDatabase(database_id, dbUsername, dbPassword) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: dbUsername, password: dbPassword });
        con.connect(function (err) {
            if (err) 
            console.log("Connected!");
        });
        var query = 'CREATE DATABASE db' + con.escape(database_id);
        con.query(query, function (err, result) {
            if (err) {
                reject(err); 
            }
            con.end();
            resolve("Database created!");
        });
    });

}
//fully add a project into the database
module.exports.addProject = function (user_id, proj_name, dbUsername, dbPassword) {
    return new Promise(function (resolve, reject) {
        getNumProjects().then(function (numRows) {
            createDatabase(numRows + 1, dbUsername, dbPassword).then(function (resp) {
                addIntoProjects(numRows + 1, proj_name, user_id, numRows + 1, dbUsername, dbPassword).then(function (resp1) {
                    module.exports.addIntoColabs(user_id, numRows + 1).then(function (resp2) {
                        resolve(numRows+1);
                    }).catch((err) => setImmediate(() => { reject(err);  }));
                }).catch((err) => setImmediate(() => { reject(err);  }));

            }).catch((err) => setImmediate(() => { reject(err);  }));
        }).catch((err) => setImmediate(() => { reject(err);  }));
    });
}
module.exports.getDBCredentials = function (project_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });

        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json = {};
        con.query("select username,password,database_id from projects where project_id=?", [project_id], function (err, rows, fields) {
            if (err) return reject(err);
            console.log(rows[0].username);
            json['username'] = rows[0].username;
            json['password'] = rows[0].password;
            json['id']="db"+rows[0].database_id;
            console.log(json);
            con.end();
            resolve(json);

        });

    });
}
//execute a query and return the response
module.exports.postQuery = function (user_id, database_id, query, dbUsername, dbPassword) {
    return new Promise(function (resolve, reject) {
        module.exports.isColab(user_id, database_id).then(function (bool) {
            if (bool) {
                var mysql = require('mysql');

                var con = mysql.createConnection({ host: 'localhost', user: dbUsername, password: dbPassword, database: 'db' + database_id });
                con.connect(function (err) {
                    if (err) return reject(err);
                    console.log("Connected!");
                });
                var json = {};
                con.query(query, function (err, rows, fields) {
                    if (err) return reject(err);
                    json['result'] = rows;
                    con.end();
                    resolve(JSON.stringify(json));

                });
            }
            else reject('no authorization');
        });
    });
}
//DELETE
//delete entry from projects table
function deleteFromProjects(proj_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');
        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
        con.connect(function (err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        con.query('delete from projects where project_id=?', [proj_id], function (err, rows, fields) {
            if (err) return reject(err);
            con.end();
            resolve('Deleted successfuly!');

        });

    });
}
//delete a collaboration
module.exports.deleteAColab = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        module.exports.isColab(user_id, project_id).then(function (bool) {
            if (bool) {
                var mysql = require('mysql');
                var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
                con.connect(function (err) {
                    if (err) return reject(err);
                    console.log("Connected!");
                });

                con.query('delete from colabs where project_id=? and user_id=?', [project_id, user_id], function (err, rows, fields) {
                    if (err) return reject(err);
                    con.end();
                    resolve('Deleted successfuly!');

                });
            }
            else reject('no authorization');
        });

    });
}
//delete all collabs for a project
module.exports.deleteFromColabs = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        module.exports.isColab(user_id, project_id).then(function (bool) {
            if (bool) {
                var mysql = require('mysql');
                var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'project_management' });
                con.connect(function (err) {
                    if (err) return reject(err);
                    console.log("Connected!");
                });

                con.query('delete from colabs where project_id=?', [project_id], function (err, rows, fields) {
                    if (err) return reject(err);
                    con.end();
                    resolve('Deleted successfuly!');

                });
            }
            else reject('no authorization');
        });

    });
}
//delete database
function deleteDatabase(database_id) {
    return new Promise(function (resolve, reject) {
        var mysql = require('mysql');

        var con = mysql.createConnection({ host: 'localhost', user: 'root', password: 'root' });
        con.connect(function (err) {
            if (err) 
            console.log("Connected!");
            var query = 'DROP DATABASE db' + con.escape(parseInt(database_id));
            con.query(query, function (err, result) {
                if (err) {
                    reject(err); 
                }

                resolve("Database created!");
            });
        })
    });

}
//fully delete a project from the server
module.exports.deleteProject = function (user_id, project_id) {
    return new Promise(function (resolve, reject) {
        module.exports.isColab(user_id, project_id).then(function (bool) {
            if (bool) {
                module.exports.deleteFromColabs(user_id, project_id).then(function (resp1) {
                    deleteDatabase(project_id).then(function (resp) {
                        deleteFromProjects(project_id).then(function (resp2) {
                            resolve(true);
                        }).catch((err) => setImmediate(() => { reject(err);  }));
                    }).catch((err) => setImmediate(() => { reject(err);  }));

                }).catch((err) => setImmediate(() => { reject(err);  }));
            }
            else reject('no authorization');

        }).catch((err) => setImmediate(() => { reject(err);  }));
    });
}