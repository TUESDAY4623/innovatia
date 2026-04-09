# 🏆 Event Team Scoring Dashboard

A premium, mobile-first web application designed for college events where professors can manage team marks across multiple rounds. Features real-time search, dynamic sorting, and an intuitive scoring interface — all optimized for smartphones.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📱 **Mobile-First** | Touch-friendly UI optimized for portrait orientation on phones |
| 🔍 **Real-time Search** | Instantly find any team by typing their name |
| 📊 **Round Filtering** | Switch between Round 1, Round 2, Round 3, or Total score view |
| ↕️ **Dynamic Sorting** | Toggle between Highest First and Lowest First rankings |
| 🥇 **Rank Badges** | Gold, Silver, and Bronze badges for the top 3 teams |
| 👨‍🏫 **Professor Mode** | Toggle to enable editing — add teams, update marks, delete teams |
| 🔔 **Toast Notifications** | Animated success/error/info popups instead of ugly alerts |
| ⚠️ **Confirm Dialogs** | Safe deletion with a custom confirm prompt |
| 📝 **Score Chips** | Every card shows all 3 round scores at a glance |
| 🧮 **Total Score** | Auto-calculated combined score across all rounds |

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla CSS3, JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | MongoDB (via Mongoose ODM) |
| Icons | [Lucide Icons](https://lucide.dev/) (CDN) |
| Typography | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

## 📁 Project Structure

```
event-website/
├── public/                  ← Frontend assets (served by Express)
│   ├── index.html           ← Main dashboard page
│   ├── style.css            ← Complete design system (light mode)
│   └── script.js            ← Client-side logic (API, render, modals)
│
├── server.js                ← Express server + Mongoose models + API routes
├── .env                     ← Environment variables (PORT, DB URI)
├── package.json             ← Dependencies and scripts
│
├── README.md                ← This file
├── SETUP.md                 ← Step-by-step setup guide
├── PROJECT_EXPLANATION.md   ← Detailed code explanation
└── EVENT_DETAILS.md         ← Template for event rules & judges
```

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Make sure MongoDB is running on your machine

# 3. Start the server
node server.js

# 4. Open in browser
# http://localhost:5000
```

> For detailed setup instructions, see **[SETUP.md](SETUP.md)**.

## 📖 Usage Guide

### For Students (View Mode)
1. Open `http://localhost:5000` on your phone or laptop.
2. Browse the team list — scores are visible for all rounds.
3. Use the **search bar** to find your team instantly.
4. Tap **Round 1 / Round 2 / Round 3 / Total** to switch views.
5. Tap the **sort icon** (↕) to toggle ranking order.

### For Professors (Edit Mode)
1. Toggle the **Professor** switch in the top-right corner.
2. A floating **+** button appears — tap it to add a team.
3. Tap the **pencil ✏️** icon on any team card to update marks for all 3 rounds at once.
4. Tap the **trash 🗑️** icon to delete a team (confirmation required).

## 📚 Documentation

| File | Purpose |
|------|---------|
| [SETUP.md](SETUP.md) | Complete installation & setup guide |
| [PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md) | How the code works (file-by-file) |
| [EVENT_DETAILS.md](EVENT_DETAILS.md) | Template for your event's rules & judges |

## 🤝 Contributing

This is a college event project. Feel free to fork and adapt it for your own events!

---

*Built with ❤️ for college event management.*
