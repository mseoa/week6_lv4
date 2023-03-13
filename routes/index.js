const express = require('express');
const router = express.Router();

const usersRouter = require("./users.route")
const loginRouter = require("./login.route")
const postsRouter = require("./posts.route")
const commentsRouter = require("./comments.route")
const likesRouter = require("./likes.route")

router.use('/',likesRouter)
router.use('/signup', usersRouter)
router.use('/login', loginRouter)
router.use('/posts', postsRouter)
router.use('/posts/:postId/comments', commentsRouter)


module.exports = router;