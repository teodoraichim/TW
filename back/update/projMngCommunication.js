const http=require('http');

module.exports.isColab=function(user_id,project_id)
{
    return new Promise(function(resolve,reject)
    {

        const options = {
            hostname: 'localhost',
            port:8000,
            path: '/isColab?project_id='+project_id+'&user_id='+user_id,
            method: 'GET'
            // headers: {
            //     'Content-Type': 'application/x-www-form-urlencoded',
            //     'Content-Length': Buffer.byteLength(postData)
            //   }

          };
          console.log('request:'+options.path);
          const req=http.request(options,(res)=>{
              console.log('Response code'+res.statusCode);
              if(res.statusCode==200) resolve(true);
              else resolve(false);
              res.on('data', (chunk) => {
                console.log(`BODY: ${chunk}`);
              });
              res.on('end', () => {
                console.log('No more data in response.');
              });

          }).on('error', function(e) {
            console.error(e);
            reject(e);
          });
          req.end();

    });

}
module.exports.executeQuery=function(user_token,project_id,query)
{
    // return new Promise(function(resolve,reject)
    // {

    //     const options = {
    //         hostname: 'http:localhost:8000',
    //         path: '/projects/query?project_id='+project_id+'&query='+query,
    //         method: 'GET',
    //         headers: {
    //           'Content-Type': 'application/x-www-form-urlencoded',
    //           'Authorization':'Bearer:'+user_token,
    //           'Content-Length': Buffer.byteLength(postData)
    //         }
    //       };

    // });
}