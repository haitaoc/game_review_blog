import { IComment } from '@entities/Comment';
import PostDao from '@daos/PostDao';

class CommentDao {
    // Acts as in memory database, structured specifically for the performance of
    // the available usages
    public static commentMap: Map<number, IComment[]> = new Map<number, IComment[]>();
    private static count: number = 0;

    public static addOne(comment: IComment): IComment | undefined {
        // A comment is invalid if authorName or content is empty string
        if (comment.authorName === '' || comment.content === '') {
            return undefined;
        }

        // Don't add comment if the post doesn't exist
        if (PostDao.getOne(comment.postId) === undefined) {
            return undefined;
        }

        comment.id = CommentDao.count;
        CommentDao.count++;

        let comments: IComment[] | undefined = CommentDao.commentMap.get(comment.postId);
        if (comments === undefined) {
            CommentDao.commentMap.set(comment.postId, [comment]);
        } else {
            comments.push(comment);
            CommentDao.commentMap.set(comment.postId, comments);
        }
        return comment;
    }

    public static getAllForPost(postId: number): IComment[] {
        const comments = CommentDao.commentMap.get(postId);
        if (comments === undefined) {
            return [];
        }
        return comments;
    }
}

export default CommentDao;