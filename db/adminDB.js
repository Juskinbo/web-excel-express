const pool = require("./pool");

module.exports = {
  get_all_info() {
    const sql = `select name, phone_number, room_id, skills, willingness, type from user_info`;
    return pool.execute(sql, []);
  },
};
