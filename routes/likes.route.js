const express = require('express');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();
const { Posts, Likes, Users, sequelize } = require('../models');
const { Op } = require('sequelize');
const { parseModelToFlatObject } = require('../helpers/sequelize.helper'); 

//게시글 좋아요 등록
router.put("/posts/:postId/like", authMiddleware, async(req,res)=>{
    try {
        const { postId } = req.params;
        const { userId } = res.locals.user;

        const isExistPost = await Posts.findByPk(postId)
       
        if(!isExistPost){
            return res.status(404).json({
                errorMessage: '게시글이 존재하지 않습니다.'
            })
        }

        let isLike = await Likes.findOne({
            where: {
                PostId: postId,
                userId: userId 
            }
        })

        if(!isLike){
            await Likes.create({PostId:postId, UserId:userId})

            return res.status(200).json({message:'게시글 좋아요를 등록하였습니다.'})
        } else {
            await Likes.destroy({
                where: {PostId:postId, UserId:userId}
            })
            return res.status(200).json({message: '게시글 좋아요를 취소하였습니다.'})
        }
    } catch (error) {
        console.error(error.message)
        return res.status(400).json({errorMessage:'게시글 좋아요에 실패하였습니다.'})
    }
})

//내가 좋아요한 게시글 조회
router.get('/posts/like', authMiddleware, async (req,res)=>{
    try {
        const { userId } = res.locals.user;
        const myLikedPosts = await Likes.findAll({
            attributes: ['PostId'],
            where:{UserId:userId}
        })
        const myLikedPostIds = myLikedPosts.map(post=>post.PostId)
        
        const posts = await Posts.findAll({
            attributes: [
                'postId',
                'title',
                'createdAt',
                'updatedAt',
                [sequelize.fn('COUNT',sequelize.col('Likes.UserId')),'likes']
            ],
            include: [
                {
                    model: Users,
                    attributes: ['userId','nickname']
                },
                {
                    model: Likes,
                    attributes: [],
                    required: true,
                }
            ],
            group: ['Posts.postId'],
            order: [[sequelize.fn('COUNT',sequelize.col('Likes.UserId')), 'DESC']],
            raw: true,
            where: {
                postId: {
                    [Op.in]: myLikedPostIds
                }
            }
        }).then((models) => models.map(parseModelToFlatObject))

        return res.status(200).json({posts: posts})
    } catch (error) {
        console.error(error.message)
        res.status(400).json({errorMessage: '좋아요 게시글 조회에 실패하였습니다.'})
    }
})


module.exports = router;

