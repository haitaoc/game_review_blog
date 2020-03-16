import PostDao from '@daos/PostDao';
import { IPost } from '@entities/Post';


describe('PostDao Tests', () => {
    const samplePost1: IPost = {
        id: 0,
        title: 'sample 1',
        content: 'sample 1 content',
        authorName: 'tester1'
    };
    const samplePost2: IPost = {
        id: 1,
        title: 'sample 2',
        content: 'sample 2 content',
        authorName: 'tester1'
    };
    const samplePost3: IPost = {
        id: 2,
        title: 'sample 3',
        content: 'sample 3 content',
        authorName: 'tester2'
    };
    const samplePost4: IPost = {
        id: 3,
        title: 'sample 4',
        content: 'sample 4 content',
        authorName: 'tester2'
    };

    beforeEach((done) => {
        // initialize the Post "database" as empty
        PostDao.postMap = new Map<number, IPost>();
        done();
    });

    describe(`Test getting one post`, () => {
        it(`should return undefined for getting non-existent post and the stored post if exists`, (done) => {
            // Try getting posts from empty "database" should return undefined
            const failedPost1 = PostDao.getOne(0);
            const failedPost2 = PostDao.getOne(100);
            const failedPost3 = PostDao.getOne(-1);

            expect(failedPost1).toBeUndefined();
            expect(failedPost2).toBeUndefined();
            expect(failedPost3).toBeUndefined();

            // Store some record to Post "database"
            PostDao.postMap.set(samplePost1.id, samplePost1);
            PostDao.postMap.set(samplePost2.id, samplePost2);

            const succPost1 = PostDao.getOne(samplePost1.id);
            const succPost2 = PostDao.getOne(samplePost2.id);
            const failedPost4 = PostDao.getOne(50);
            expect(succPost1).toEqual(samplePost1);
            expect(succPost2).toEqual(samplePost2);
            expect(failedPost4).toBeUndefined();

            done();
        });
    });

    describe(`Test getting all Posts`, () => {
        it(`should return empty array for empty post database or all posts if there are stored ones`, (done) => {
            // Initial database is empty so the array should be empty
            const emptyPosts = PostDao.getAll();
            expect(emptyPosts.length).toEqual(0);

            PostDao.postMap.set(samplePost1.id, samplePost1);
            PostDao.postMap.set(samplePost2.id, samplePost2);

            // Try getting the 2 posts added and check the content
            const posts1 = PostDao.getAll();
            expect(posts1.length).toEqual(2);
            expect(posts1.includes(samplePost1)).toBeTrue();
            expect(posts1.includes(samplePost2)).toBeTrue();
            expect(posts1.includes(samplePost3)).toBeFalse();

            PostDao.postMap.set(samplePost3.id, samplePost3);
            // Try getting the 3 posts and check the content
            const posts2 = PostDao.getAll();
            expect(posts2.length).toEqual(3);
            expect(posts2.includes(samplePost1)).toBeTrue();
            expect(posts2.includes(samplePost2)).toBeTrue();
            expect(posts2.includes(samplePost3)).toBeTrue();
            expect(posts2.includes(samplePost4)).toBeFalse();

            done();
        });
    });

    describe(`Test adding one post`, () => {
        it(`should return undefined for invalid post`, (done) => {
            // Posts with one required field being empty string
            const invalidPost1: IPost = {
                id: -1,
                title: '',
                content: 'some content 1',
                authorName: 'author1'
            };
            const invalidPost2: IPost = {
                id: -1,
                title: 'title2',
                content: '',
                authorName: 'author2'
            };
            const invalidPost3: IPost = {
                id: -1,
                title: 'title3',
                content: 'some content 3',
                authorName: ''
            };
            // Posts with multiple required field being empty string
            const invalidPost4: IPost = {
                id: -1,
                title: '',
                content: '',
                authorName: 'author4'
            };
            const invalidPost5: IPost = {
                id: -1,
                title: 'title5',
                content: '',
                authorName: ''
            };
            const invalidPost6: IPost = {
                id: -1,
                title: '',
                content: '',
                authorName: ''
            };

            const res1 = PostDao.addOne(invalidPost1);
            const res2 = PostDao.addOne(invalidPost2);
            const res3 = PostDao.addOne(invalidPost3);
            const res4 = PostDao.addOne(invalidPost4);
            const res5 = PostDao.addOne(invalidPost5);
            const res6 = PostDao.addOne(invalidPost6);

            expect(res1).toBeUndefined();
            expect(res2).toBeUndefined();
            expect(res3).toBeUndefined();
            expect(res4).toBeUndefined();
            expect(res5).toBeUndefined();
            expect(res6).toBeUndefined();

            done();
        });

        it (`should return the post added for valid post`, (done) => {
            expect(PostDao.postMap.size).toEqual(0);

            // valid post might have differnt id, but other fields will remain the same
            const res1 = PostDao.addOne(samplePost1);
            expect(PostDao.postMap.size).toEqual(1);
            expect(res1).toBeDefined();
            expect(res1?.title).toEqual(samplePost1.title);
            expect(res1?.content).toEqual(samplePost1.content);
            expect(res1?.authorName).toEqual(samplePost1.authorName);

            // If the res1 is defined, we do futher validation
            // or the previous test cases will show error
            if (res1 !== undefined) {
                const post1 = PostDao.postMap.get(res1.id);
                expect(post1).toEqual(res1);
            }

            const res2 = PostDao.addOne(samplePost2);
            expect(PostDao.postMap.size).toEqual(2);
            expect(res2).toBeDefined();
            expect(res2?.title).toEqual(samplePost2.title);
            expect(res2?.content).toEqual(samplePost2.content);
            expect(res2?.authorName).toEqual(samplePost2.authorName);

            // If the res2 is defined, we do futher validation
            // or the previous test cases will show error
            if (res2 !== undefined) {
                const post2 = PostDao.postMap.get(res2.id);
                expect(post2).toEqual(res2);
                // Make sure this add doesn't affect the previous one
                if (res1 !== undefined) {
                    const newPost1 = PostDao.postMap.get(res1.id);
                    expect(newPost1).toEqual(res1);
                }
            }

            done();
        });
    });
});
