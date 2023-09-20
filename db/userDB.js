const pool = require("./pool");

module.exports = {
  // 检测电话号码是否已注册
  check_phone_number(phone_number) {
    const sql = `select * from account where phone_number=?`;
    return pool.execute(sql, [phone_number]);
  },
  // 用户注册
  async register(name, password, phone_number) {
    const sql1 = `insert into account (password, phone_number) values (?, ?)`;
    const sql2 = `insert into user_info (name, phone_number, type) values (?, ?, ?)`;
    await pool.execute(sql1, [password, phone_number]);
    return await pool.execute(sql2, [name, phone_number, "user"]);
  },
  // 获取本人信息
  get_my_info(phone_number) {
    const sql = `select name, phone_number, room_id, skills, willingness, type from user_info where phone_number=?`;
    return pool.execute(sql, [phone_number]);
  },
  // 获取所有人信息时候不包括本人信息，同时所有人手机号应该进行部分隐藏
  async get_all_info(phone_number) {
    const sql = `select name, phone_number, room_id, skills, type from user_info where type!='visitor' and phone_number != ?`;
    const result = await pool.execute(sql, [phone_number]);
    for (let i = 0; i < result.length; i++) {
      result[i].phone_number =
        result[i].phone_number.substring(0, 3) +
        "****" +
        result[i].phone_number.substring(7, 11);
    }
    return result;
  },
  // 修改本人信息
  change_my_info(phone_number, info) {
    const sql = `update user_info set name=?, room_id=?, skills=?, willingness=? where phone_number=?`;
    return pool.execute(sql, [
      info.name,
      info.room_id,
      info.skills,
      info.willingness,
      info.phone_number,
    ]);
  },
  submit_my_info(name, phone_number, room_id, skills, willingness) {
    const type = "visitor";
    const sql = `insert into user_info (name, phone_number, room_id, skills, willingness, type) values (?, ?, ?, ?, ?, ?)`;
    return pool.execute(sql, [
      name,
      phone_number,
      room_id,
      skills,
      willingness,
      type,
    ]);
  },
};
