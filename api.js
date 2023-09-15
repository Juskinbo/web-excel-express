const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const userDB = require("./db/userDB");
const adminDB = require("./db/adminDB");
const loginDB = require("./db/loginDB");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

function sha256Hash(input) {
  const hash = crypto.createHash("sha256");
  const hashedValue = hash.update(input).digest("hex");
  return hashedValue;
}

function generateToken(unionid) {
  const payload = { unionid: unionid };
  const token = jwt.sign(payload, process.env.jwt_secret_key);
  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.jwt_secret_key);
    return decoded; // 返回值是payload
  } catch (err) {
    return null;
  }
}

router.post("/login", (req, res) => {
  const unionid = req.body.unionid;
  const password = sha256Hash(req.body.password);
  loginDB.check_account(unionid).then((result) => {
    if (result.length === 0) {
      res.json({
        result: "error",
        msg: "unionid错误",
      });
    } else {
      if (result[0].password === password) {
        res.json({
          result: "success",
          token: generateToken(unionid),
        });
      } else {
        res.json({
          result: "error",
          msg: "密码错误",
        });
      }
    }
  });
});
router.post("/user", (req, res) => {
  // req包含参数opt
  // opt 是希望执行的操作
  // 开始判断opt
  if (req.body.opt === "register") {
    userDB.check_unionid(req.body.unionid).then((result1) => {
      userDB.check_phone_number(req.body.phone_number).then((result2) => {
        if (result1.length === 0 && result2.length === 0) {
          // 代表用户名和电话号码都未注册
          userDB
            .register(
              req.body.unionid,
              req.body.name,
              sha256Hash(req.body.password),
              req.body.phone_number
            )
            .then((result) => {
              res.json({
                result: "success",
              });
            });
        } else if (result1.length !== 0) {
          res.json({
            // 代表用户ID已注册
            result: "error",
            failed: "unionid",
          });
        } else if (result2.length !== 0) {
          res.json({
            // 代表用户名已注册
            result: "error",
            failed: "phone_number",
          });
        }
      });
    });
  } else if (req.body.opt === "submit_my_info") {
    // 未登录用户通过表单提交的信息
    userDB
      .submit_my_info(
        req.body.name,
        req.body.phone_number,
        req.body.room_id,
        req.body.skills,
        req.body.willingness
      )
      .then((result) => {
        res.json({
          result: "success",
          msg: "提交成功",
        });
      });
  } else {
    // 获取本人信息
    if (!req.body.token) {
      res.json({
        result: "error",
        msg: "opt参数错误",
      });
      return;
    }
    // 判断一下token函数是否正确
    const payload = verifyToken(req.body.token);
    if (payload === null) {
      res.json({
        result: "error",
        msg: "token错误",
      });
      return;
    }
    const unionid = payload.unionid;
    userDB.get_my_info(unionid).then((result) => {
      // 判断一下数据库中该用户是否存在
      if (result.length === 0) {
        res.json({
          result: "error",
          msg: "unionid错误",
        });
      } else {
        if (req.body.opt === "get_my_info") {
          res.json({
            name: result[0].name,
            phone_number: result[0].phone_number,
            room_id: result[0].room_id,
            skills: result[0].skills,
            willingness: result[0].willingness,
            type: result[0].type,
          });
        } else if (req.body.opt === "get_all_info") {
          // 获取所有信息，不包含意愿度，并且无法获取游客信息，获取的手机号中间四位不显示，同时不获取本人信息
          userDB.get_all_info(unionid).then((result) => {
            console.log(result);
            res.json({
              count: result.length,
              data: result,
            });
          });
        } else if (req.body.opt === "change_my_info") {
          // 登录用户修改个人信息
          userDB.change_my_info(unionid, req.body.info).then((result) => {
            res.json({
              result: "success",
              msg: "修改成功",
            });
          });
        } else {
          // opt参数错误
          res.json({
            result: "error",
            msg: "opt参数错误",
          });
        }
      }
    });
  }
});

router.post("/admin", (req, res) => {
  // 先判断一下是否是admin用户
  const payload = verifyToken(req.body.token);
  if (payload === null) {
    res.json({
      result: "error",
      msg: "token错误",
    });
    return;
  }
  const unionid = payload.unionid;
  userDB.get_my_info(unionid).then((result) => {
    if (result.length === 0 || result[0].type !== "admin") {
      console.log(result);
      res.json({
        result: "error",
        msg: "unionid错误或无权限",
      });
      return;
    }
    // opt = 'get_all_info' 管理员获取所有信息，包含意愿度
    if (req.body.opt === "get_all_info") {
      adminDB.get_all_info(unionid).then((result) => {
        res.json({
          count: result.length,
          data: result,
        });
      });
    } else if(req.body.opt === "admin_change_info") {
      adminDB.admin_change_info(req.body.info).then((result) => {
        res.json({
          result: "success",
          msg: "修改成功",
        });
      });
    }else {
      res.json({
        result: "error",
        msg: "opt参数错误",
      });
    }
  });
});

module.exports = router;
