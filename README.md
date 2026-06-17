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
| `mylist.html` | The **My List** result view (after running a search) |
| `contactdetails.html` | The **Contact Record** — an individual voter / contact profile |
| `assets/css/liberalist.css` | All styling — the app chrome, sidebar, panels, CAL & QLU |
| `assets/js/liberalist.js` | Shared chrome interactions — sidebar, dropdowns, search |
| `assets/js/createalist.js` | Create A List behaviours — sections, favorites, preview |
| `assets/js/quicklookup.js` | Quick Look Up — filtering, sorting (uses the dataset) |
| `assets/js/mylist.js` | My List — stats, action toolbar, filter (uses the dataset) |
| `assets/js/contactdetails.js` | Contact Record — renders one person's profile (uses the dataset) |
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

### Two sides of the database

The header tabs switch which side you're working in — a core VAN concept:

- **My Voters → Voter File** (`TRAINING_VOTERFILE`): static electors from
  Elections Ontario. Used to ID voters; canvass/survey responses are recorded
  here. Core elector data is read-only.
- **Shared Contacts** (`TRAINING_SHARED`): the committee's own volunteers,
  donors and members — records volunteers can create and edit.

The active side is stored in `localStorage` and persists across pages.
`assets/js/liberalist.js` manages it and exposes `window.LLTraining`
(`getSide()`, `setSide()`, `onSideChange()`). Quick Look Up switches its
columns and data based on the active side and shows a banner explaining it.
The Shared Contacts side also tints the chrome with the warm "tan" theme,
matching the real app.

### Activist Codes

`TRAINING_ACTIVIST_CODES` holds the committee's activist codes grouped by
type (Cultural Background, Email, Fundraising, Language, Membership). These
are used heavily on the Shared Contacts side. Create A List → **Activist
Codes** renders them as a grouped, checkable picker (Status, Check All /
Check All Activists / Un-Check All, and per-type Check Type).

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
- ~~My List (`MyList.aspx`)~~ ✅ done
- ~~Contact Record (`ContactsDetails.aspx`)~~ ✅ done

The flow now connects: Main Menu → Create a List → **Run Search** lands on
My List; clicking a person's **name** in My List or Quick Look Up opens their
**Contact Record**; the sidebar and menu cards link the pages together.

### Contact Record (`contactdetails.html`)

The individual profile for one person. It reads `?id=` and `?side=` from the
URL (falling back to the active database side and the first record) and shows:

- a **contact summary header** (avatar, name, an ID/contact-type tag, phone,
  address) tinted for whichever side you're on;
- collapsible **page sections** — Survey Responses (their affiliation ID,
  volunteer status and dated **sign history**), Activist Codes, Addresses,
  Phones, Email, Voting History and an editable Notes box;
- a narrow column with the **record-navigation** panel (Standard / Script /
  Form view modes, jump-by-ID, Next), **Favorites**, Vital Stats, Districts and
  the **Voter File VANID** / Contact ID block;
- a sticky **Save All** footer.

Favorite stars pin a section into the Favorites box. Everything is read from
the shared dataset, so the Voter File and Shared Contacts sides each show the
fields that make sense for that side.
- Grid View / Form View / Quick Mark (data entry)
- Canvass Results, Turfs, Virtual Phone Bank
- Counts and Crosstabs, Report Manager

## Conventions for adding pages

- Reuse the header + sidebar markup from `index.html` so chrome stays consistent.
- Add new icons to the inline SVG sprite at the top of the page.
- Keep all sample data **fake**. Never paste real voter PII or live session
  tokens (VIEWSTATE, JWTs, etc.) into these files.
