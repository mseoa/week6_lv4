const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const {Users} = require("../models");

// 로그인
router.post("/", async (req, res) => {
    const { nickname, password } = req.body;
    const user = await Users.findOne({ where: { nickname } });
    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 닉네임입니다." });
    } else if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }
  
    const token = jwt.sign({
      userId: user.userId
    }, "customized_secret_key");
    res.cookie("authorization", `Bearer ${token}`);
    return res.status(200).json({ message: "로그인 성공" });
  });

  module.exports = router;