const pool = require("./pool");

module.exports = {
  // 获取所有人信息时候不包括本人信息
  get_all_info(phone_number) {
    const sql = `select name, phone_number, room_id, skills, willingness, type from user_info where phone_number != ?`;
    return pool.execute(sql, [phone_number]);
  },
  admin_change_info(info) {
    const sql = `update user_info set name=?, room_id=?, skills=?, willingness=? where phone_number=?`;
    return pool.execute(sql, [
      info.name,
      info.room_id,
      info.skills,
      info.willingness,
      info.phone_number,
    ]);
  },
};
