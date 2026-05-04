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

## Writing LaTeX

The template loads KaTeX from a CDN and auto-renders math anywhere in the post.
Use any of these delimiter pairs:

| Inline                | Display                |
| --------------------- | ---------------------- |
| `$ ... $`             | `$$ ... $$`            |
| `\( ... \)`           | `\[ ... \]`            |

Example:

```html
<p>The variance is $\sigma^2 = \mathbb{E}[(X - \mu)^2]$.</p>

<p>$$ \int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi} $$</p>
```

A few gotchas:

- **HTML escaping wins first.** `<`, `>`, and `&` inside math should be written as
  `\lt`, `\gt`, `\&` (or use `&lt;`/`&gt;`/`&amp;`). Otherwise the browser eats them
  before KaTeX sees them.
- **Backslashes in attributes.** Inside HTML attributes, double them: `\\frac` not `\frac`.
- **Dollar signs in prose.** A literal `$` followed later by another `$` will be
  parsed as math. Escape with `\$` when you mean currency.
- KaTeX's full function list: <https://katex.org/docs/supported.html>.
