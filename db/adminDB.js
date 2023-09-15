const pool = require("./pool");

module.exports = {
  // 获取所有人信息时候不包括本人信息
  get_all_info(unionid) {
    const sql = `select unionid, name, phone_number, room_id, skills, willingness, type from user_info where unionid != ?`;
    return pool.execute(sql, [unionid]);
  },
  admin_change_info(info) {
    const sql = `update user_info set name=?, phone_number=?, room_id=?, skills=?, willingness=? where unionid=?`;
    return pool.execute(sql, [
      info.name,
      info.phone_number,
      info.room_id,
      info.skills,
      info.willingness,
      info.unionid,
    ]);
  }
};
