const express = require('express');
const router = express.Router();
const { check , validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @roue Post api/Posts
// @desc Create a post
// @access Private
router.post('/', [ auth, [check('text', 'Text is required').not().isEmpty()]], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });
    // we add the post and get it back in response
    const post = await newPost.save();

    res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }

    }
);

// @roue Get api/Posts
// @desc Get all posts
// @access Private

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

// @roue Get api/Posts/:id
// @desc Get posts by ID
// @access Private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        res.status(500).json('Server Error');
    }
});

// @roue delete api/posts/:id
// @desc delete a posts
// @access Private

router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        // Check user
        if(post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg : 'User not authorized'});
        }

        await post.remove();

        res.json({ msg: 'Post deleted' });

    } catch (err) {
        console.error(err.message);
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        res.status(500).json('Server Error');
    }
});

// @roue PUT api/posts/like/:id
// @desc Like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if the post has already been liked by 'this' user
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: 'Post already liked' });
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @roue PUT api/posts/unlike/:id
// @desc Unlike a post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        //check if the post  been unlike by 'this' user
        if(!post.likes.some(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ msg: 'Post has not yet been liked' });
        }

        // get the remove index
        post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id)

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @roue Post api/Posts
// @desc Create a post
// @access Private
router.post('/', [ auth, [check('text', 'Text is required').not().isEmpty()]], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    };

    post.Comments.unshift(newComment);
    // we add the post and get it back in response
    await Post.save();

    res.json(post.Comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }

    }
);

// @roue Get api/Posts/comment/:id
// @desc Comment on a post
// @access Private

router.get('/comment/:id', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});

// @roue Get api/Posts/:id
// @desc Get posts by ID
// @access Private

router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        res.json(post);
    } catch (err) {
        console.error(err.message)
        if(err.kind === 'ObjectId') {
            return res.status(404).json({ msg : 'Post Not Found' });
        }
        res.status(500).json('Server Error');
    }
});
module.exports = router;