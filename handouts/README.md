# Handouts

Problem sets and worksheets I've written. PDFs that should appear on
`/handouts.html` live in this folder; the listing is driven by `handouts.json`.

## Adding a new handout

1. Drop your PDF in this folder, e.g. `handouts/algebra-warmups.pdf`.
2. Add an entry to `handouts.json`:

```json
[
    {
        "title": "Algebra Warm-ups",
        "subject": "Math",
        "difficulty": "Intro",
        "summary": "Ten warm-up problems on linear equations and inequalities.",
        "date": "2026-04-20",
        "tags": ["math", "warmup"],
        "file": "algebra-warmups.pdf"
    }
]
```

Field reference:

| Field      | Required | Notes                                                  |
| ---------- | -------- | ------------------------------------------------------ |
| title      | yes      | Card title and viewer header.                          |
| file       | yes      | Filename inside this `handouts/` folder.               |
| subject    | no       | e.g. "Math", "Chemistry" — shown in card meta line.    |
| difficulty | no       | e.g. "Intro", "Hard" — shown in card meta line.        |
| date       | no       | `YYYY-MM-DD`. Used for sorting (newest first).         |
| summary    | no       | One- or two-line description.                          |
| tags       | no       | Array of strings, rendered as tag chips.               |

Direct-link to a specific handout: `handouts.html?handout=your-file.pdf`.
