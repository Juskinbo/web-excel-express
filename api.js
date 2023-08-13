const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const userDB = require("./db/userDB");
const adminDB = require("./db/adminDB");
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/user", (req, res) => {
  // req包含参数opt
  // opt 是希望执行的操作
  // 开始判断opt
  if (req.body.opt === "submit_my_info") {
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
    if(!req.body.unionid){
      res.json({
        result:"error",
        msg:"opt参数错误"
      })
      return;
    }
    userDB.get_my_info(req.body.unionid).then((result) => {
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
          });
        } else if (req.body.opt === "get_all_info") {
          // 获取所有信息，不包含意愿度
          userDB.get_all_info().then((result) => {
            console.log(result);
            res.json({
              count: result.length,
              data: result,
            });
          });
        } else if (req.body.opt === "change_my_info") {
          // 登录用户修改个人信息
          userDB
            .change_my_info(req.body.unionid, req.body.info)
            .then((result) => {
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
  userDB.get_my_info(req.body.unionid).then((result) => {
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
      adminDB.get_all_info().then((result) => {
        res.json({
          count: result.length,
          data: result,
        });
      });
    } else {
      res.json({
        result: "error",
        msg: "opt参数错误",
      });
    }
  });
});

module.exports = router;
