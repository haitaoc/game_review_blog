import CommentDao from '@daos/CommentDao';
import PostDao from '@daos/PostDao';
import { IComment } from '@entities/Comment';
import { IPost } from '@entities/Post';


describe('CommentDao Tests:', () => {
    const sampleComment1: IComment = {
        id: 0,
        postId: 0,
        content: 'sample 1 content',
        authorName: 'tester1'
    };
    const sampleComment2: IComment = {
        id: 1,
        postId: 0,
        content: 'sample 2 content',
        authorName: 'tester1'
    };
    const sampleComment3: IComment = {
        id: 2,
        postId: 0,
        content: 'sample 3 content',
        authorName: 'tester2'
    };
    const sampleComment4: IComment = {
        id: 3,
        postId: 1,
        content: 'sample 4 content',
        authorName: 'tester2'
    };
    const sampleComment5: IComment = {
        id: 3,
        postId: 2,
        content: 'sample 4 content',
        authorName: 'tester2'
    };

    beforeEach((done) => {
        // initialize the Post "database" with 2 posts
        PostDao.postMap = new Map<number, IPost>();
        PostDao.postMap.set(0, {
            id: 0,
            title: 'title1',
            content: 'content 1',
            authorName: 'author1'
        });
        PostDao.postMap.set(1, {
            id: 1,
            title: 'title2',
            content: 'content 2',
            authorName: 'author2'
        });

        CommentDao.commentMap = new Map<number, IComment[]>();
        done();
    });

    describe(`Test add one comment for post`, () => {
        it(`should return undefined for adding comment for non-existent post`, (done) => {
            expect(PostDao.postMap.size).toEqual(2);
            expect(CommentDao.commentMap.size).toEqual(0);

            const res1 = CommentDao.addOne(sampleComment5);
            expect(res1).toBeUndefined();
            // Comment "database" should not be affected by this add
            expect(CommentDao.commentMap.size).toEqual(0);

            done();
        });

        it(`should return undefined for adding invalid comment to existing post`, (done) => {
            // the comment with valid postId and some empty required field
            const invalidComment1: IComment = {
                id: -1,
                postId: 0,
                content: '',
                authorName: 'author1'
            };
            const invalidComment2: IComment = {
                id: -1,
                postId: 0,
                content: 'content 2',
                authorName: ''
            };
            const invalidComment3: IComment = {
                id: -1,
                postId: 0,
                content: '',
                authorName: ''
            };
            
            expect(PostDao.postMap.size).toEqual(2);
            expect(CommentDao.commentMap.size).toEqual(0);

            const res1 = CommentDao.addOne(invalidComment1);
            expect(res1).toBeUndefined();
            expect(CommentDao.commentMap.size).toEqual(0);

            const res2 = CommentDao.addOne(invalidComment2);
            expect(res2).toBeUndefined();
            expect(CommentDao.commentMap.size).toEqual(0);

            const res3 = CommentDao.addOne(invalidComment3);
            expect(res3).toBeUndefined();
            expect(CommentDao.commentMap.size).toEqual(0);

            done();
        });

        it(`should return the Comment added with the id set for valid comment`, (done) => {
            expect(PostDao.postMap.size).toEqual(2);
            expect(CommentDao.commentMap.size).toEqual(0);

            // Add the first comment
            const res1 = CommentDao.addOne(sampleComment1);
            expect(res1).toBeDefined();
            expect(res1?.authorName).toEqual(sampleComment1.authorName);
            expect(res1?.content).toEqual(sampleComment1.content);
            expect(res1?.postId).toEqual(sampleComment1.postId);
            expect(CommentDao.commentMap.size).toEqual(1);

            let comments = CommentDao.commentMap.get(sampleComment1.postId);
            if (comments !== undefined) {
                expect(comments.length).toEqual(1);
                expect(res1).toEqual(comments[0]);
            }

            // Add second comment on the same post
            const res2 = CommentDao.addOne(sampleComment2);
            expect(res2).toBeDefined();
            expect(res2?.authorName).toEqual(sampleComment2.authorName);
            expect(res2?.content).toEqual(sampleComment2.content);
            expect(res2?.postId).toEqual(sampleComment2.postId);
            // Adding comment to the same post should append it under the same postId (key)
            // Thus, not changing the size of dictionary
            expect(CommentDao.commentMap.size).toEqual(1);

            // Add again third comment on the same post
            comments = CommentDao.commentMap.get(sampleComment2.postId);
            if (comments !== undefined) {
                expect(comments.length).toEqual(2);
                expect(res2).toEqual(comments[1]);
            }

            const res3 = CommentDao.addOne(sampleComment3);
            expect(res3).toBeDefined();
            expect(res3?.authorName).toEqual(sampleComment3.authorName);
            expect(res3?.content).toEqual(sampleComment3.content);
            expect(res3?.postId).toEqual(sampleComment3.postId);
            // Adding comment to the same post should append it under the same postId (key)
            // Thus, not changing the size of dictionary
            expect(CommentDao.commentMap.size).toEqual(1);

            comments = CommentDao.commentMap.get(sampleComment3.postId);
            if (comments !== undefined) {
                expect(comments.length).toEqual(3);
                expect(res3).toEqual(comments[2]);
            }

            // Add a comment to a different post 
            const res4 = CommentDao.addOne(sampleComment4);
            expect(res4).toBeDefined();
            expect(res4?.authorName).toEqual(sampleComment4.authorName);
            expect(res4?.content).toEqual(sampleComment4.content);
            expect(res4?.postId).toEqual(sampleComment4.postId);
            // Adding comment to a different post should increase the size by 1
            expect(CommentDao.commentMap.size).toEqual(2);

            comments = CommentDao.commentMap.get(sampleComment4.postId);
            if (comments !== undefined) {
                expect(comments.length).toEqual(1);
                expect(res4).toEqual(comments[0]);
            }

            done();
        });
    });

    describe(`Test getting all comments for a post`, () => {
        it(`should return empty array for non-existent post, and all comments if exists`, (done) => {
            expect(PostDao.postMap.size).toEqual(2);
            expect(CommentDao.commentMap.size).toEqual(0);

            // Get comment for existing post without comments
            let comments = CommentDao.getAllForPost(0);
            expect(comments.length).toEqual(0);

            // Add comments and get, should return all comments for post
            CommentDao.commentMap.set(0, [sampleComment1, sampleComment2]);
            comments = CommentDao.getAllForPost(0);
            expect(comments.length).toEqual(2);
            expect(comments.includes(sampleComment1)).toBeTrue();
            expect(comments.includes(sampleComment2)).toBeTrue();

            CommentDao.commentMap.set(0, [sampleComment1, sampleComment2, sampleComment3]);
            comments = CommentDao.getAllForPost(0);
            expect(comments.length).toEqual(3);
            expect(comments.includes(sampleComment1)).toBeTrue();
            expect(comments.includes(sampleComment2)).toBeTrue();
            expect(comments.includes(sampleComment3)).toBeTrue();

            // Check get comments for a different post
            CommentDao.commentMap.set(1, [sampleComment4]);
            comments = CommentDao.getAllForPost(1);
            expect(comments.length).toEqual(1);
            expect(comments.includes(sampleComment4)).toBeTrue();

            done();
        });
    });
});
