const pool = require("./pool");

module.exports = {
  // 检测用户名是否已存在
  check_unionid(name) {
    const sql = `select * from account where unionid=?`;
    return pool.execute(sql, [name]);
  },
  // 检测电话号码是否已注册
  check_phone_number(phone_number) {
    const sql = `select * from account where phone_number=?`;
    return pool.execute(sql, [phone_number]);
  },
  // 用户注册
  async register(unionid, name, password, phone_number) {
    const sql1 = `insert into account (unionid, password, phone_number) values (?, ?, ?)`;
    const sql2 = `insert into user_info (unionid, name, phone_number, type) values (?, ?, ?, ?)`;
    await pool.execute(sql1, [unionid, password, phone_number]);
    return await pool.execute(sql2, [unionid, name, phone_number, "user"]);
  },
  // 获取本人信息
  get_my_info(unionid) {
    const sql = `select name, phone_number, room_id, skills, willingness, type from user_info where unionid=?`;
    return pool.execute(sql, [unionid]);
  },
  // 获取所有人信息时候不包括本人信息，同时所有人手机号应该进行部分隐藏
  async get_all_info(unionid) {
    const sql = `select name, phone_number, room_id, skills, type from user_info where type!='visitor' and unionid != ?`;
    const result = await pool.execute(sql, [unionid]);
    for (let i = 0; i < result.length; i++) {
      result[i].phone_number =
        result[i].phone_number.substring(0, 3) +
        "****" +
        result[i].phone_number.substring(7, 11);
    }
    return result;
  },
  // 此处注意函数参数不确定
  change_my_info(unionid, info) {
    const sql = `update user_info set name=?, phone_number=?, room_id=?, skills=?, willingness=? where unionid=?`;
    return pool.execute(sql, [
      info.name,
      info.phone_number,
      info.room_id,
      info.skills,
      info.willingness,
      unionid,
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
