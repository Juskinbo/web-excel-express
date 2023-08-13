require("dotenv").config({ path: ".env" });
require("babel-polyfill");
const mysql = require("mysql2");
const pool = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  socketPath: process.env.socketPath,
  database: process.env.database,
});

function getConnection() {
  return new Promise(function (resolve, reject) {
    pool.getConnection(function (err, conn) {
      if (!err) {
        resolve(conn);
      } else {
        reject(err);
      }
    });
  });
}

function execute(sql, values) {
  return new Promise(function (resolve, reject) {
    var connection;
    getConnection()
      .then(function (conn) {
        conn.query(sql, values, function (err, result) {
          if (!err) {
            resolve(result);
            conn.release();
            console.log("释放完成");
          } else {
            reject(err);
          }
        });
      })
      .catch(function (err) {
        reject(err);
      });
  });
}
module.exports = {
  getConnection,
  execute,
};
