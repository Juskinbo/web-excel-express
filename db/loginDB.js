const pool = require("./pool");

module.exports = {
  check_account(phone_number) {
    const sql = `select password from account where phone_number = ?`;
    return pool.execute(sql, [phone_number]);
  },
};
