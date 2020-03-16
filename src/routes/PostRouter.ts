import { Request, Response, Router } from 'express';
import { NOT_FOUND, BAD_REQUEST, CREATED, OK } from 'http-status-codes';

import PostDao from '@daos/PostDao';
import CommentDao from '@daos/CommentDao';
import { paramMissingError, creationFailed, lookupFailed } from '@shared/constants';
import { IPost } from '@entities/Post';
import { IComment } from '@entities/Comment';

// Init shared
const router = Router();

// Get all posts
router.get('/', (req: Request, res: Response) => {
    res.status(OK).json(PostDao.getAll());
});

// Add one post
router.post('/', (req: Request, res: Response) => {
    const {
        title,
        content,
        authorName
    } = req.body;

    if (title === undefined || content === undefined || authorName === undefined) {
        res.status(BAD_REQUEST).json({
            error: paramMissingError
        });
        return;
    }

    const post: IPost = {
        id: -1,
        title: title,
        content: content,
        authorName: authorName
    };

    let retPost = undefined;
    try {
        retPost = PostDao.addOne(post);
    } catch (error) {
        res.status(BAD_REQUEST).json({
            error: creationFailed
        });
        return;
    }

    if (retPost === undefined) {
        res.status(BAD_REQUEST).json({
            error: creationFailed
        });
        return;
    }

    res.status(CREATED).json({
        data: retPost
    });
});

// Get a specific post
router.get('/:postId', (req: Request, res: Response) => {
    const postId = req.params.postId;

    const post = PostDao.getOne(Number(postId));
    if (post === undefined) {
        res.status(NOT_FOUND).json({
            error: lookupFailed
        });
    } else {
        res.status(OK).json({
            data: post
        });
    }
});

// Get all comments for a post
router.get('/:postId/comments', (req: Request, res: Response) => {
    const postId = req.params.postId;
    const post = PostDao.getOne(Number(postId));

    if (post === undefined) {
        res.status(NOT_FOUND).json([]);
        return;
    }

    res.status(OK).json(CommentDao.getAllForPost(Number(postId)));
});

// Add one comment for a specific post
router.post('/:postId/comments', (req: Request, res: Response) => {
    const postId = Number(req.params.postId);
    const {
        content,
        authorName
    } = req.body;

    if (content === undefined || authorName === undefined) {
        res.status(BAD_REQUEST).json({
            error: paramMissingError
        });
        return;
    }

    const comment: IComment = {
        id: -1,
        postId: postId,
        content: content,
        authorName: authorName
    };

    let retComment = undefined;
    try {
        retComment = CommentDao.addOne(comment);
    } catch (error) {
        res.status(BAD_REQUEST).json({
            error:creationFailed
        });
        return;
    }

    if (retComment === undefined) {
        res.status(BAD_REQUEST).json({
            error: creationFailed
        });
        return;
    }
    res.status(CREATED).json({
        data: retComment
    });
});

export default router;
