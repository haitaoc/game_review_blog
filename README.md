# Game Review Blog Server
This is a RESTful API (Thus no front-end or UI included) to enable to following user story:
`As an avid video game reviewer 
I want a way to create blog posts for my video game reviews 
So that I can share my reviews in a way that my readers can respond to`

## API Design
### Actions
To fulfill the above user story, the following are the minimum actions required:
1. Get all posts
2. Add a new post
3. Get a specific post
4. Get all comments associated with a post
5. Add a new comment for a post

### Resources
#### Post: represents a blog review post
* `id`: unique post id
* `title`: post title (cannot be empty)
* `content`: post body in plain text (cannot be empty)
* `authorName`: name of the post creator (cannot be empty)
`{
  id: number,
  title: string,
  content: string,
  authorName: string
}`

#### Comment: represents a comment attached to a post
* `id`: unique comment id
* `postId`: post id of the associated post
* `content`: comment body in plain text (cannot be empty)
* `authorName`: name of the comment creator (cannot be empty)
`{
  id: number,
  postId: number,
  content: string,
  authorName: string
}`

### API
| Path | Method | Description | Request Body | Response Status | Response Format |
| ---- | ------ | ----------- | -------------- | --------------- | --------------- |
|/posts| GET  | Get all posts from the system|  | 200(OK)        | Post[]          |
|      | POST | Create a new post | {title: string, content: string, authorName: string} | 201(CREATED), 400(BAD_REQUEST) | {data: Post} \| {error: string} |
|/posts/:postId| GET | Get a specific post by id |  | 200(OK), 404(NOT_FOUND) | {data: Post} \| {error: string} |
|/posts/:postId/comments| GET | Get all comments for a specific post |  | 200(OK), 404(NOT_FOUND) | Post[] \| [] |
| | POST | Create a new comment for a specific post | {content: string, authorName: string} | 201(CREATED), 400(BAD_REQUEST) | {data: Comment} \| {error: string} |

