# Blog

Each post is a standalone HTML file in this folder. To add a new post:

1. Copy `2026-05-03-hello-world.html` to a new file (e.g. `2026-06-01-my-post.html`).
2. Edit the `<title>`, `<h1>`, date, and body content.
3. Add a new entry to `posts.json` at the top of the array:

```json
{
    "title": "My new post",
    "summary": "One-line description shown on the blog index.",
    "date": "2026-06-01",
    "readTime": "5 min read",
    "tags": ["robotics", "rl"],
    "url": "blog/2026-06-01-my-post.html"
}
```

Posts are sorted by `date` (newest first) automatically.
