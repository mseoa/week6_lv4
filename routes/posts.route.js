const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

const {Posts} = require("../models")


// 게시글 작성 (끝)
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { userId, nickname } = res.locals.user;
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
        }
        await Posts.create({ UserId: userId, nickname, title, content })
        res.status(201).json({ message: "게시글 작성에 성공하였습니다." })
    } catch (error) {
        res.status(400).json({ "errorMessage" : error.message })
    }
})


//전체 게시글 목록 조회 (끝)
router.get("/", async (req, res) => {
    try {
        const posts = await Posts.findAll({
            attributes: ['postId', 'UserId','nickname','title','createdAt','updatedAt'],
            order: [['createdAt', 'DESC']],
        })

        res.status(200).json({ posts: posts });
    } catch (error) {
        res.status(400).json({ "errorMessage" : "게시글 조회에 실패하였습니다." })
    }

})

// 게시글 상세 조회 (끝)
router.get("/:postId", async (req, res) => {
    try {
        const { postId } = req.params
        const post = await Posts.findOne({
            // attributes: ["postId", "UserId", "title", "content", "createdAt", "updatedAt"],
            where: { postId }
          });
        res.json({ post: post });
    } catch (error) {
        res.status(400).json({ errorMessage: "게시글 조회에 실패하였습니다." })
    }
})



// 게시글 수정 (끝)
router.put("/:postId", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const post = await Posts.findOne({ where: { postId } });
        if (post.UserId!==userId){
            return res.status(403).json({errorMessage: "게시글의 수정 권한이 존재하지 않습니다."})
        }
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글 조회에 실패했습니다." })
        }
        const { title, content } = req.body;
        await Posts.update(
            { title, content }, // title과 content 컬럼을 수정합니다.
            {
              where: {
                [Op.and]: [{ postId }, { UserId: userId }],
              }
            }
          );
        res.status(200).json({ message: "게시글을 수정하였습니다." });

    } catch (error) {
        console.log("error",error.message)
        res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다" })
        //게시글 조회에 실패했습니다
    }
})


// 게시글 삭제 (끝)
router.delete("/:postId", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user
        const post = await Posts.findOne({ where: { postId } });
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        if (post.UserId!==userId){
            return res.status(403).json({errorMessage: "게시글의 삭제 권한이 존재하지 않습니다."})
        }
        await Posts.destroy({
            where: {
              [Op.and]: [{ postId }, { UserId: userId }],
            }
          });
        return res.status(200).json({ message: "게시글을 삭제하였습니다." });

    } catch (error) {
        res.status(400).json({ errorMessage: error.message })
    }
})


module.exports = router;