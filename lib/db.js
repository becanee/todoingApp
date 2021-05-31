const mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root1234',
  database : 'todoing'
});

connection.connect(function (error) {
   if (error) throw error;
   console.log('Koneksi DB Berhasil!');
});

module.exports = connection; 