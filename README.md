# LL-Training — Liberalist Training Mock

A self-contained, **clean-room training replica** of the VAN / Liberalist
interface, built so staff can learn the layout, navigation, and tools
**without an account and without touching real voter data**.

> This is an independent training aid. It is **not** affiliated with, or
> derived from the source code of, NGP VAN / Bonterra. The look is
> approximated from the public UI; all data shown is fake placeholder data.

## What's here

| File | Purpose |
|------|---------|
| `index.html` | The **Main Menu** screen |
| `createalist.html` | The **Create A List** ("Create A New Search") wizard |
| `quicklookup.html` | The **Quick Look Up** contact search + results grid |
| `assets/css/liberalist.css` | All styling — the app chrome, sidebar, panels, CAL & QLU |
| `assets/js/liberalist.js` | Shared chrome interactions — sidebar, dropdowns, search |
| `assets/js/createalist.js` | Create A List behaviours — sections, favorites, preview |
| `assets/js/quicklookup.js` | Quick Look Up — filtering, sorting (uses the dataset) |
| `assets/data/training-data.js` | **Master training dataset** — fictional people + survey data |

## Training dataset (`assets/data/training-data.js`)

Single source of truth for the mock, loaded before the page scripts. Exposes:

- `TRAINING_SURVEY_QUESTIONS` — each survey question and its valid responses
  (2025/2029 Affiliation ID, Volunteer Status, Sign Request).
- `TRAINING_CONTACTS` — 10 fictional voters. Each has the Quick Look Up
  columns plus a `survey` object: their **2025 affiliation ID**, **volunteer
  status**, and a dated **sign history** (request → install → maintenance →
  removal, etc.).

Quick Look Up reads its rows from here, and Create A List reads the survey
questions from here, so adding a person or response in one file updates both
pages. **Everything is fictional — never add real voter data.**

## Running it

No build step. Just open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Implemented so far

- Top app bar: branding, notifications dropdown, user dropdown, language toggle
- "My Voters" / "Shared Contacts" tabs
- Slide-out sidebar (hamburger) with collapsible page groups + live page search
- Main Menu three-column card layout:
  - **Left:** personal links (with count badges) + Administrative Menu accordion
  - **Center:** Quick Look Up, Lists, Canvassing, Reporting, Voting Data Entry
  - **Right:** Load Data, Quick Tasks

## Roadmap (next screens / tools)

These are the real pages linked from the menu — each becomes its own mock page:

- ~~Quick Look Up (`QuickLookUp.aspx`)~~ ✅ done
- ~~Create a List (`CreateAList.aspx`)~~ ✅ done
- My List (`MyList.aspx`)
- Grid View / Form View / Quick Mark (data entry)
- Canvass Results, Turfs, Virtual Phone Bank
- Counts and Crosstabs, Report Manager

## Conventions for adding pages

- Reuse the header + sidebar markup from `index.html` so chrome stays consistent.
- Add new icons to the inline SVG sprite at the top of the page.
- Keep all sample data **fake**. Never paste real voter PII or live session
  tokens (VIEWSTATE, JWTs, etc.) into these files.
