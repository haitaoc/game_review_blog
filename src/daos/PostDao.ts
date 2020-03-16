import { IPost } from '@entities/Post';
import logger from '@shared/Logger';

class PostDao {
    // Acts as in memory database, structured specifically for the performance of
    // the available usages
    public static postMap: Map<number, IPost> = new Map<number, IPost>();
    private static count: number = 0;

    public static getOne(id: number): IPost | undefined {
        return PostDao.postMap.get(id);
    }

    public static getAll(): IPost[] {
        let posts: IPost[] = [];
        PostDao.postMap.forEach((post) => {
            posts.push(post);
        });
        return posts;
    }

    public static addOne(post: IPost): IPost | undefined {
        // A post is invalid if authorName, title or content is empty
        if (post.authorName === '' || post.title === '' || post.content === '') {
            return undefined;
        }

        post.id = PostDao.count;
        PostDao.count++;

        PostDao.postMap.set(post.id, post);
        return post;
    }
}

export default PostDao;