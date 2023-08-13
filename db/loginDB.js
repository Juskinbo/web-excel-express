const pool = require("./pool");

module.exports = {
  check_account(unionid) {
    const sql = `select password from account where unionid = ?`;
    return pool.execute(sql, [unionid]);
  },
};
