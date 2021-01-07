var mysql      = require('mysql');
var { promisify } = require('util');

var connection = mysql.createConnection({ //BDD de prueba, alojada en Clever Cloud
  host     : 'btybocmzqwjmgfj0v1gz-mysql.services.clever-cloud.com',
  user     : 'umgrc5x0imq3dgab',
  password : 'SIzAoCYRMvPsbYQXX9Ti',
  database : 'btybocmzqwjmgfj0v1gz',
  multipleStatements: true
});

connection.connect( (error) => {
    if(error){
        console.log("Error al conectar la BD")
    }
    console.log('Se ha establecido conexión a la base de datos. ID: ' + connection.threadId);
})

connection.query = promisify(connection.query);


module.exports = connection;