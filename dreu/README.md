# DREU journal

Everything on the DREU page is driven by `dreu.json` — no HTML edits needed.

## Name & mentor

Edit the top-level fields:

```json
"student": "Cosmo Wu",
"studentSub": "B.S. Computer Science, The University of Texas at Austin",
"mentor": "Prof. Jane Doe",
"mentorSub": "ECE Department, Kansas State University",
"program": "DREU — Distributed Research Experiences for Undergraduates",
"term": "Summer 2026 · Manhattan, KS",
"focus": "One-sentence description of your research shown under the page title."
```

## Weekly entries

Add one object per week to the `weeks` array. All four bullet lists are
optional — empty/missing ones are simply not rendered.

```json
{
    "week": 2,
    "title": "First agent prototype",
    "date": "Jun 8 – Jun 12, 2026",
    "goals": ["...", "..."],
    "approach": ["...", "..."],
    "results": ["...", "..."],
    "notes": ["...", "..."]
}
```

Weeks are sorted by `week` number and the latest one starts expanded.

## PDFs / reports

1. Drop the PDF into this `dreu/` folder.
2. Add an entry to the `reports` array:

```json
{
    "title": "Midterm Report",
    "date": "2026-07-10",
    "summary": "Short description shown on the card.",
    "file": "midterm_report.pdf",
    "tags": ["report", "langgraph"]
}
```

You can deep-link to a report with `/dreu/?report=midterm_report.pdf`.

## Extra updates

Add entries to the `updates` array; newest date shows first:

```json
{
    "date": "2026-07-04",
    "title": "Poster accepted",
    "body": "A couple of sentences about the update."
}
```
