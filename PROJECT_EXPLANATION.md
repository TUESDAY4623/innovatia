# 📘 Project Explanation

A detailed, file-by-file explanation of how the Event Scoring Dashboard works. Designed for anyone who wants to understand the code — whether you're a student learning web development or a professor reviewing the project.

---

## Architecture Overview

```
┌──────────────────────────────────────────┐
│              USER'S BROWSER              │
│  ┌─────────────────────────────────────┐ │
│  │  index.html  +  style.css           │ │
│  │         (Structure & Design)        │ │
│  └─────────────────────────────────────┘ │
│  ┌─────────────────────────────────────┐ │
│  │           script.js                 │ │
│  │  (Fetch data, Render cards, Modals) │ │
│  └──────────────┬──────────────────────┘ │
│                 │  HTTP Requests          │
│                 │  (GET, POST, PATCH,     │
│                 │   DELETE /api/teams)    │
└─────────────────┼────────────────────────┘
                  │
   ┌──────────────▼──────────────────────┐
   │          server.js                  │
   │   (Express.js REST API Server)      │
   │                                     │
   │  Routes:                            │
   │   GET    /api/teams     → All teams │
   │   GET    /api/teams/:id → One team  │
   │   POST   /api/teams     → Add team  │
   │   PATCH  /api/teams/:id → Update    │
   │   DELETE /api/teams/:id → Delete    │
   └──────────────┬──────────────────────┘
                  │
   ┌──────────────▼──────────────────────┐
   │          MongoDB Database           │
   │    Collection: "teams"              │
   │                                     │
   │  Document shape:                    │
   │  {                                  │
   │    _id: ObjectId,                   │
   │    name: "Team Alpha",              │
   │    round1: 45,                      │
   │    round2: null,                    │
   │    round3: null,                    │
   │    createdAt: Date,                 │
   │    total: 45  (virtual)             │
   │  }                                  │
   └─────────────────────────────────────┘
```

---

## File-by-File Explanation

---

### 1. `server.js` — The Backend

This is the heart of the application. It does three things:
1. **Serves the frontend** files from the `public/` folder.
2. **Connects to MongoDB** using Mongoose.
3. **Exposes a REST API** for managing teams.

#### Key Concepts Used

| Concept | What It Does |
|---------|-------------|
| `express.static('public')` | Serves HTML/CSS/JS files to the browser without needing separate routes |
| `mongoose.Schema` | Defines the shape of a "Team" document in MongoDB |
| `mongoose.virtual('total')` | A computed field that adds round1 + round2 + round3 automatically |
| `async/await` | Handles database operations without blocking the server |
| Error code `11000` | MongoDB's duplicate key error — caught to show a friendly "already exists" message |

#### API Endpoints

| Method | URL | Body | Response |
|--------|-----|------|----------|
| `GET` | `/api/teams` | — | Array of all teams |
| `GET` | `/api/teams/:id` | — | Single team object |
| `POST` | `/api/teams` | `{ name }` | Created team (201) |
| `PATCH` | `/api/teams/:id` | `{ round1, round2, round3 }` | Updated team |
| `DELETE` | `/api/teams/:id` | — | Success message |

#### How the Schema Works

```javascript
const teamSchema = new mongoose.Schema({
    name:      { type: String, required: true, unique: true, trim: true },
    round1:    { type: Number, default: null },   // null = "not graded yet"
    round2:    { type: Number, default: null },   // 0 = "graded as zero"
    round3:    { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }  // auto-set on creation
});
```

- **`default: null`** is intentional — it lets us distinguish between "not yet graded" (shown as `—` in the UI) and "scored 0" (shown as `0`).
- **`unique: true`** on `name` prevents duplicate team names at the database level.
- **`trim: true`** automatically removes leading/trailing spaces from team names.

#### Virtual Field: `total`

```javascript
teamSchema.virtual('total').get(function () {
    return (this.round1 || 0) + (this.round2 || 0) + (this.round3 || 0);
});
```

This is a **computed property** — it doesn't exist in the database, but is calculated and included every time a team is sent as JSON. The `|| 0` ensures `null` values are treated as `0` in the total.

---

### 2. `public/index.html` — The Page Structure

This file defines the skeleton of the dashboard. It's divided into these sections:

| Section | Purpose |
|---------|---------|
| `<header>` | Contains the title, Professor toggle, search bar, round filters, and sort button |
| `<main>` | Contains the stats bar, team card list, and empty state |
| FAB container | The floating "+" button (hidden until Professor Mode is on) |
| Modal overlay | A slide-up bottom sheet for adding teams and editing marks |
| Toast container | Where animated notifications appear |
| Confirm overlay | A centered dialog for delete confirmations |

#### Key Design Decisions

- **No JavaScript frameworks** — pure vanilla JS to keep it simple and fast.
- **Lucide Icons** loaded via CDN — lightweight, modern SVG icons.
- **`user-scalable=no`** in viewport meta — prevents accidental pinch-zoom on phones during the event.
- **Bottom-sheet modal** pattern — feels natural on mobile (slides up from the bottom).

---

### 3. `public/style.css` — The Design System

The entire visual identity is defined through **CSS custom properties** (variables):

```css
:root {
    --primary: #6366f1;        /* Indigo — used everywhere */
    --primary-light: #818cf8;  /* Lighter shade for borders */
    --primary-lighter: #e0e7ff; /* Very light for backgrounds */
    --bg: #f1f5f9;             /* Page background (light gray) */
    --bg-card: #ffffff;        /* Card background (white) */
    --text: #0f172a;           /* Main text (near-black) */
    --text-muted: #94a3b8;     /* Secondary text (gray) */
    ...
}
```

#### Key CSS Features

| Feature | How It Works |
|---------|-------------|
| **Rank Badges** | `.rank-badge.gold` uses `linear-gradient` for a metallic effect |
| **Sticky Header** | `position: sticky; top: 0` keeps controls visible while scrolling |
| **Slide-up Modal** | `transform: translateY(100%)` → `translateY(0)` with cubic-bezier timing |
| **Toast Animation** | `@keyframes toastIn` fades in, then `toastOut` after 2.5s auto-removes |
| **Card Stagger** | `animation-delay` set per card in JS creates a cascade entrance effect |
| **Backdrop Blur** | `backdrop-filter: blur(4px)` on overlays for a frosted glass look |

#### Responsive Design

The layout is designed for **mobile first** (max-width: 640px container). On desktop:
- The modal switches from a bottom-sheet to a centered dialog.
- The container stays narrow (640px max) for readability.

---

### 4. `public/script.js` — The Brain

This file handles all interactivity. Here's the breakdown:

#### State Management

```javascript
let teams = [];              // All teams from the database
let currentRound = 'total';  // Which round/total is being viewed
let sortAsc = false;         // false = highest first, true = lowest first
let isProfMode = false;      // Is editing enabled?
```

The app uses a simple "fetch → store in array → re-render" pattern. Every change (add, edit, delete) triggers `fetchTeams()` which reloads all data from the server and re-renders the list.

#### Core Functions

| Function | What It Does |
|----------|-------------|
| `fetchTeams()` | Calls `GET /api/teams`, stores result, triggers `renderTeams()` |
| `renderTeams()` | Filters by search, sorts by round, builds HTML cards, attaches listeners |
| `addTeam(name)` | Calls `POST /api/teams`, refreshes list, shows toast |
| `updateTeamMarks(id, updates)` | Calls `PATCH /api/teams/:id`, refreshes list, shows toast |
| `deleteTeam(id, name)` | Shows confirm dialog → calls `DELETE /api/teams/:id` |

#### Security: XSS Prevention

```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;  // Browser auto-escapes special characters
    return div.innerHTML;    // Returns safe HTML string
}
```

Every team name is passed through `escapeHtml()` before being inserted into the page. This prevents malicious input like `<script>alert('hacked')</script>` from executing.

#### The Render Flow

```
User types in search / clicks filter / changes sort
         │
         ▼
    renderTeams()
         │
         ├── 1. Filter teams by search term
         ├── 2. Sort by current round score
         ├── 3. Clear the team list container
         ├── 4. Check if empty → show empty state
         ├── 5. Loop through filtered teams:
         │      ├── Create card element
         │      ├── Set rank badge (gold/silver/bronze)
         │      ├── Build score chips (R1/R2/R3)
         │      ├── Add edit/delete buttons if professor mode
         │      └── Append to list
         ├── 6. Initialize Lucide icons in new cards
         └── 7. Attach click listeners to edit/delete buttons
```

#### Modal System

Instead of using browser `prompt()` dialogs (which look terrible on mobile), the app uses a custom modal:

1. `openModal(title, bodyHTML)` — injects HTML into the modal body and shows it with a slide-up animation.
2. `closeModal()` — hides the modal.
3. The modal can be closed by clicking the × button or tapping outside it.

Two specialized functions build the modal content:
- `openAddTeamModal()` — a form with a single "Team Name" input.
- `openEditModal(id, name)` — a form with three number inputs for the round scores, pre-filled with current values.

#### Toast Notifications

```javascript
function showToast(message, type = 'success') { ... }
```

Creates a small popup at the bottom of the screen that auto-disappears after 3 seconds. Three types:
- `success` (green) — "Team added!", "Marks updated!"
- `error` (red) — "Failed to add team", "Network error"
- `info` (purple) — "Professor Mode enabled", "Team deleted"

---

### 5. `.env` — Configuration

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-website
```

These values are loaded by `dotenv` at the top of `server.js`. This keeps sensitive configuration out of the code.

---

### 6. `package.json` — Dependencies

```json
{
    "dependencies": {
        "cors": "^2.8.5",       // Allows requests from different origins
        "dotenv": "^16.4.5",    // Loads .env variables into process.env
        "express": "^4.19.2",   // Web server framework
        "mongoose": "^8.3.0"    // MongoDB driver with schema validation
    }
}
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────┐
│  1. Professor toggles "Professor Mode" ON   │
│  2. Taps "+" button → modal opens           │
│  3. Types "Team Alpha" → submits form       │
│                                             │
│  4. script.js sends:                        │
│     POST /api/teams { name: "Team Alpha" }  │
│                                             │
│  5. server.js validates → saves to MongoDB  │
│  6. Returns { _id, name, round1, ... }      │
│                                             │
│  7. script.js calls fetchTeams()            │
│  8. GET /api/teams → returns all teams      │
│  9. renderTeams() rebuilds the card list    │
│ 10. Toast: "Team Alpha added!" ✅           │
└─────────────────────────────────────────────┘
```

---

> For setup instructions, see **[SETUP.md](SETUP.md)**. For usage, see **[README.md](README.md)**.
