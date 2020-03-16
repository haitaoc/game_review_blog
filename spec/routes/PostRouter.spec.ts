import supertest from 'supertest';
import { BAD_REQUEST, CREATED, OK, NOT_FOUND } from 'http-status-codes';
import { Response, SuperTest, Test } from 'supertest';

import app from '@server';
import { pErr } from '@shared/functions';
import { paramMissingError, creationFailed, lookupFailed } from '@shared/constants';
import { IPost } from '@entities/Post';
import PostDao from '@daos/PostDao';
import { IComment } from '@entities/Comment';
import CommentDao from '@daos/CommentDao';


describe('Post Router Test: ', () => {
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

    const sampleComment1: IComment = {
        id: 0,
        postId: 0,
        content: 'content 1',
        authorName: 'author1'
    };

    const sampleComment2: IComment = {
        id: 1,
        postId: 0,
        content: 'content 2',
        authorName: 'author2'
    };

    const postsPath = '/api/posts';
    const specificPostPath = `${postsPath}/:postId`;
    const postCommentsPath = `${specificPostPath}/comments`;

    let agent: SuperTest<Test>;

    beforeAll((done) => {
        agent = supertest.agent(app);
        done();
    });

    describe(`[GET] on ${postsPath}`, () => {
        it(`should return a JSON object with all the posts and a status code of "${OK}" on
            success.`, (done) => {

            const emptyPosts: IPost[] = [];
            const posts: IPost[] = [samplePost1, samplePost2, samplePost3, samplePost4];

            spyOn(PostDao, 'getAll').and.returnValues(emptyPosts, posts);

            agent.get(postsPath)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(OK);
                    
                    const retPosts: IPost[] = res.body;
                    expect(retPosts).toEqual(emptyPosts);
                    done();
                });

            agent.get(postsPath)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(OK);
                    
                    const retPosts: IPost[] = res.body;
                    expect(retPosts).toEqual(posts);
                    done();
                });
        });
    });

    describe(`[POST] on ${postsPath}`, () => {
        it(`should return a status code of "${CREATED}" for successful request`, (done) => {

            spyOn(PostDao, 'addOne').and.returnValue(samplePost1);
            const postStr = JSON.stringify(samplePost1);

            agent.post(postsPath).type('json').send(postStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(CREATED);
                    expect(res.body.error).toBeUndefined();
                    expect(res.body.data).toEqual(samplePost1);

                    done();
                });
        });

        it(`should return a JSON object with an error message of "${paramMissingError}" and a status
            code of "${BAD_REQUEST}" if the required param was missing.`, (done) => {

            spyOn(PostDao, 'addOne').and.returnValue(undefined);

            const postStr = JSON.stringify({})
            agent.post(postsPath).type('json').send(postStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(paramMissingError);
                    expect(res.body.data).toBeUndefined();

                    done();
                });
        });

        it(`should return a JSON object with an error message and a status code of "${BAD_REQUEST}"
            for unsuccessful creation`, (done) => {

            spyOn(PostDao, 'addOne').and.throwError('');
            const postStr = JSON.stringify(samplePost1);

            agent.post(postsPath).type('json').send(postStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(creationFailed);

                    done();
                });
        });
    });

    describe(`[GET] on ${specificPostPath}`, () => {
        it(`should return a JSON object with error msg and a status code of "${NOT_FOUND}" on
            failure.`, (done) => {

            spyOn(PostDao, 'getOne').and.returnValue(undefined);

            agent.get(`${postsPath}/100`)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(NOT_FOUND);
                    expect(res.body.data).toBeUndefined();
                    expect(res.body.error).toBe(lookupFailed);

                    done();
                });
        });

        it (`should return a JSON object for a specific post and a status code of "${OK}" on
            success.`, (done) => {

            spyOn(PostDao, 'getOne').and.returnValue(samplePost1);

            agent.get(`${postsPath}/0`)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(OK);
                    expect(res.body.error).toBeUndefined();
                    expect(res.body.data).toEqual(samplePost1);

                    done();
                });
        });
    });

    describe(`[GET] on ${postCommentsPath}`, () => {
        it(`should return a JSON object with empty array if post does not exist and a status code of "${NOT_FOUND}"`, (done) => {

            spyOn(PostDao, 'getOne').and.returnValue(undefined);

            agent.get(`${postsPath}/100/comments`)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(NOT_FOUND);
                    expect(res.body).toEqual([]);

                    done();
                });
        });

        it(`should return a JSON object with all comments for a post and a status code of "${OK}" on
            success.`, (done) => {

            const comments = [sampleComment1, sampleComment2];

            spyOn(PostDao, 'getOne').and.returnValue(samplePost1);
            spyOn(CommentDao, 'getAllForPost').and.returnValue(comments);

            agent.get(`${postsPath}/0/comments`)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(OK);

                    const retComments: IComment[] = res.body;
                    expect(retComments.length).toEqual(2);
                    expect(retComments).toEqual(comments);

                    done();
                });
        });
    });

    describe(`[POST] on ${postCommentsPath}`, () => {
        it(`should return a status code of "${CREATED}" for successful request`, (done) => {

            spyOn(CommentDao, 'addOne').and.returnValue(sampleComment1);
            const commentStr = JSON.stringify(sampleComment1);

            agent.post(`${postsPath}/0/comments`).type('json').send(commentStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(CREATED);
                    expect(res.body.error).toBeUndefined();
                    expect(res.body.data).toEqual(sampleComment1);

                    done();
                });
        });

        it(`should return a JSON object with an error message of "${paramMissingError}" and a status
            code of "${BAD_REQUEST}" if the required param was missing.`, (done) => {

            spyOn(CommentDao, 'addOne').and.returnValue(undefined);

            const commentStr = JSON.stringify({})
            agent.post(`${postsPath}/0/comments`).type('json').send(commentStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(paramMissingError);
                    expect(res.body.data).toBeUndefined();

                    done();
                });
        });

        it(`should return a JSON object with an error message and a status code of "${BAD_REQUEST}"
            for unsuccessful creation`, (done) => {

            spyOn(CommentDao, 'addOne').and.throwError('');
            const commentStr = JSON.stringify(sampleComment1);

            agent.post(`${postsPath}/aabbcc/comments`).type('json').send(commentStr)
                .end((err: Error, res: Response) => {
                    expect(res.status).toBe(BAD_REQUEST);
                    expect(res.body.error).toBe(creationFailed);

                    done();
                });
        });
    });
});
