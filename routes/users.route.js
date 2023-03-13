const express = require("express");
const router = express.Router();
const {Users} = require("../models");

// 회원가입 API
router.post("/", async(req,res)=>{
    try {
        const { nickname, password, confirm } = req.body;

        let nickCheck = /^[a-zA-Z0-9]{3,}$/
        if (!nickCheck.test(nickname)){
            res.status(412).json({
                errorMessage: "닉네임의 형식이 일치하지 않습니다.",
            });
            return;
        }
        if (password !== confirm) {
            res.status(400).json({
                errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
            });
            return;
        }
        if (password.includes(nickname)||password.length<4){
            res.status(412).json({
                errorMessage: "패스워드 형식이 일치하지 않습니다.",
            });
            return;
        }
        
        // email 또는 nickname이 동일한 데이터가 있는지 확인하기 위해 가져온다.
        const existsUsers = await Users.findOne({ where : {nickname} });
        if (existsUsers) {
            // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
            res.status(400).json({
                errorMessage: "중복된 닉네임입니다.",
            });
            return;
        }
    
        await Users.create({nickname, password});
    
        res.status(201).json({ message: "회원 가입에 성공하였습니다." }); 
    } catch (error) {
        return res.status(400).json({errorMessage: error.message});
    }
})

module.exports = router;