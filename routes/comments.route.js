const express = require('express')

const router = express.Router({mergeParams: true});
const authMiddleware = require('../middlewares/auth-middleware');
const { Comments } = require("../models");
const { Posts } = require("../models");
const { Users } = require("../models");
const { parseModelToFlatObject } = require('../helpers/sequelize.helper');
const { Op } = require("sequelize");

// 댓글 생성
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;
        const { comment } = req.body;
        const post = await Posts.findOne({where:{postId}});
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        if (!comment){
            return res.status(404).json({errorMessage: "댓글 내용을 입력해주세요."})
        }
        await Comments.create({PostId:postId, UserId:userId, comment})
        res.status(201).json({ message: "댓글을 작성하였습니다." })
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." })
    }
})

//댓글 목록 조회
router.get("/", async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Posts.findOne({where:{postId}});
        const nickname = post.nickname;
        console.log(nickname)
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        const comments = await Comments.findAll({
            attributes: ['commentId', 'comment','createdAt','updatedAt'],
            include: [
                {
                    model: Users,
                    attributes: ['userId','nickname']
                }
            ],
            where: [{ PostId: postId }],
            order: [['createdAt', 'DESC']],
            raw: true,
        }).then((models) => models.map(parseModelToFlatObject));
        res.json({comments: comments});
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." })
    }
})

//댓글 수정
router.put("/:commentId", authMiddleware, async (req, res) => {
    try {
        const { comment } = req.body;
        const { userId } = res.locals.user;
        const { postId, commentId } = req.params;
        const post = await Posts.findByPk(postId)
        
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        const existComment = await Comments.findByPk(commentId)
        // console.log(existComment.UserId, userId)
        if (!existComment){
            return res.status(404).json({errorMessage: "댓글이 존재하지 않습니다."})
        }
        if (existComment.UserId!==userId){
            return res.status(403).json({errorMessage: "댓글의 수정 권한이 존재하지 않습니다."})
        }
        if (!comment){
            return res.status(400).json({errorMessage: "댓글 내용을 입력해주세요."})
        }

        await Comments.update({ comment }, // title과 content 컬럼을 수정합니다.
            {where: {
                [Op.and]: [{ commentId }, { UserId: userId }],
              }}
          );
        res.status(200).json({message: "댓글을 수정하였습니다."});

    } catch (error) {
        console.log(error.message)
        res.status(400).json({errorMessage: "댓글 수정에 실패하였습니다."})
    }
})

// 댓글삭제
router.delete("/:commentId", authMiddleware, async(req,res)=>{
    try {
        const { userId } = res.locals.user;
        const { postId, commentId } = req.params;
        const post = await Posts.findOne({where:{postId}})
        if (!post) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." })
        }
        const existComment = await Comments.findOne({where:{commentId}})
        if (!existComment){
            return res.status(404).json({errorMessage: "댓글이 존재하지 않습니다."})
        }
        if (existComment.UserId!==userId){
            return res.status(403).json({errorMessage: "댓글의 삭제 권한이 존재하지 않습니다."})
        }
        await Comments.destroy({
            where: {
              [Op.and]: [{ commentId }, { UserId: userId }],
            }
          });
        return res.status(200).json({message: "댓글을 삭제하였습니다."});

    } catch (error) {
        console.log(error.message)
        res.status(400).json({errorMessage: "댓글 삭제에 실패하였습니다."})
    }
  })



module.exports = router;