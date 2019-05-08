module.exports.getProjectList=function(user_id)
{
    return new Promise(function(resolve,reject)
    {
        var mysql=require('mysql');

        var con=mysql.createConnection({host:'localhost',user:'root',password:'root',database:'project_management'});
        var result_json;
        con.connect(function(err) {
            if (err) return reject(err);
            console.log("Connected!");
        });
        var json={};
        con.query('select projects.project_name,projects.creator from projects inner join colabs on projects.project_id=colabs.project_id where colabs.user_id=?',[user_id], function (err, rows, fields) {
            if (err) return reject(err);
            json['projects']=rows;
            con.end();
            resolve(JSON.stringify(json));
            
        });

    });
    
}
module.exports.getProject=function(user_id,project_id)
{

}
module.exports.postQuery=function(user_id,database_id,query)
{

}
module.exports.getTableSchema=function(user_id,database_id,table_name)
{

}
module.exports.getTableValus=function(user_id,database_id,table_name)
{

}