# Notes

PDFs that should appear on the `/notes/` page live in this folder.
The listing is driven by `notes.json`.

## Adding a new note

1. Drop your PDF in this folder, e.g. `notes/data-structures-midterm.pdf`.
2. Add an entry to `notes.json`:

```json
[
    {
        "title": "Data Structures — Midterm Review",
        "course": "CS 314H",
        "summary": "Big-O, hash tables, trees, graphs, and the usual suspects.",
        "date": "2026-03-12",
        "tags": ["cs", "midterm"],
        "file": "data-structures-midterm.pdf"
    }
]
```

Field reference:

| Field    | Required | Notes                                                    |
| -------- | -------- | -------------------------------------------------------- |
| title    | yes      | Shown as the card title and viewer header.               |
| file     | yes      | Filename inside this `notes/` folder.                    |
| course   | no       | Shown next to the date in the card meta line.            |
| date     | no       | `YYYY-MM-DD`. Used for sorting (newest first).           |
| summary  | no       | One- or two-line description.                            |
| tags     | no       | Array of strings, rendered as tag chips.                 |

## Viewing

The notes page renders each PDF in an inline `<iframe>` viewer with a Download
button. Browsers handle PDF rendering natively — no PDF.js needed.

Direct-link to a specific note: `/notes/?note=your-file.pdf`.
