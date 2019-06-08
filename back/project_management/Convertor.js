
//Face conversia query-ului MySQL intr-o functie java folosind Connector/J 
//Are nevoie de port-ul localhostului si de numele bazei de date la care se face conexiunea
module.export.fromQueryToJava = function(query,port,path_database)
    {
        let query_spaced =query.split(" ");
        let url = "String url =\"jdbc:mysql://localhost:" + port + "/" + path_database+"\";";
        let result = url + "\n Scanner info = new Scanner(System.in); \n" +"System.out.println(\"Enter your database username\")\;    \n" + "String username =info.next();  \n" ;
        result+="System.out.println(\"Enter your database password\");  \n" + "String password =info.next();  \n";
        result += "try {  \n" + "Connection conn =DriverManager.getConnection(url,username,password); \n"
        result += "Statement stmt = conn.createStatement(); \n" + "String sql = \"" + query +"\"; \n";
        switch(query_spaced[0]){
        case "select":
            result +="String result=\"\"; \n" ;
            result += "ResultSet rs = stmt.executeQuery(sql); \n \n";
            if(query_spaced[1]=='*')
            {
                result += "ResultSetMetaData rsmd = rs.getMetaData(); \n" + "while (rs.next()){ \n" ;
                result += "for(int j=1;j<=rsmd.getColumnCount();j++) \n" + "result=result+ rs.getString(j) + \" \"; \n" + "result+=\"\\n\"; \n} \n"
    
            }
            else
            {
                let query_split =query_spaced[1].split(",");
                let query_variables = "result=result";
                for(i=0;i<query_split.length && query_split[i] != "from" ;i++)
                {
                    query_variables +="+ rs.getString(\"" + query_split[i] + "\") + \" \"" ;
                }
                query_variables +=" + \"\\n\";";
            
                
                result += "while (rs.next()){ \n \n" + query_variables +" \n } \n " ;
            }
            break;
    
        case 'default':
            result+="stmt.execute(sql);";
            break;
    
        }
        result+= "} catch (SQLException e) { \n e.printStackTrace();  \n } ";
    return result;
}

//Face conversia query-ului MySQL intr-o functie java folosind SQLi
//Are nevoie de tipul de host(localhost) userul si parola bazei de date si numele bazei de date la care se face conexiunea
module.export.fromQueryToPhp = function(host,query,user,pass,database)
{
    
    let query_spaced =query.split(" ");
    let result = "$dbServername=\"" + host + "\"; \n" + "$dbUsername=\"" + user + "\"; \n";
    result += "$dbPassword=\"" + pass + "\"; \n" + "$dbName=\"" + database + "\"; \n";
    result+="$conn=mysqli_connect($dbServername,$dbUsername,$dbPassword,$dbName); \n if ($conn->connect_error) \n { \n die(\"Connection failed: \" . $conn->connect_error); \n} \n";
    result+="$sql = \"" + query + "\"; \n $result = $conn->query($sql); \n";
    switch(query_spaced[0]){
        case "select":
        if(query_spaced[1] == "*")
        {
            result += "if ($result->num_rows > 0) { \n \t while($row = $result->fetch_assoc()) { \n \t \t foreach($row as $i =>$j) \n \t \t \t { \n \t \t \t \t echo $j . \"  \";\n \t \t \t} \n \t \techo \"<br>\";  \n \t } \n }   ";
        }
        else 
        {
        let query_split =query_spaced[1].split(",");
        let query_variables= "";
        for(i=0;i<query_split.length && query_split[i] != "from" ;i++)
        {
            query_variables+= "echo \"" + query_split[i] + ":\" . $row[\"" + query_split[i] + "\"] . "; 
        }
        query_variables += "\"<br>\"";
        result += "if ($result->num_rows > 0) \n{ \n \t while($row = $result->fetch_assoc()) \n { \n \t " + query_variables + "\n } \n } " ;
        }
        result += "else { \n \t echo \"0 results\"; \n }";
        
        break;

     case 'insert':
        result+= "if ($conn->query($sql) === TRUE) \n { \n \t echo \" Succes \"; \n } \n else { \n echo \"Failure: \". $conn->error;  \n}"
        break;


      case 'delete':
        result+= "if ($conn->query($sql) === TRUE) \n { \n \t echo \" Succes \"; \n } \n else { \n echo \"Failure: \". $conn->error;  \n}"
        break;


      case 'update':
        result+= "if ($conn->query($sql) === TRUE) \n { \n \t echo \" Succes \"; \n } \n else { \n echo \"Failure: \". $conn->error;  \n}"
        break;
    }
    return result;
}