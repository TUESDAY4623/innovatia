# 🔧 Setup Guide

A step-by-step guide to get the Event Scoring Dashboard running on your machine.

---

## Prerequisites

Before you begin, make sure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **MongoDB** | v6 or higher | [mongodb.com](https://www.mongodb.com/try/download/community) |

### How to check if they're installed

Open your terminal (Command Prompt / PowerShell / Terminal) and run:

```bash
node -v
# Should print something like: v18.x.x or higher

npm -v
# Should print something like: 10.x.x or higher

mongod --version
# Should print MongoDB version info
```

---

## Step 1: Download the Project

If you received the project as a zip file, extract it to a folder on your desktop.

If using Git:
```bash
git clone <your-repo-url>
cd event-website
```

---

## Step 2: Install Dependencies

Open your terminal, navigate to the project folder, and run:

```bash
cd c:\Users\Utkarsh\OneDrive\Desktop\clg\event-website
npm install
```

This will install:
- `express` — Web server framework
- `mongoose` — MongoDB driver (ODM)
- `cors` — Allows cross-origin requests
- `dotenv` — Loads environment variables from `.env`

---

## Step 3: Start MongoDB

MongoDB must be running before you start the server.

### Option A: If MongoDB is installed as a Windows Service (default)
It should already be running in the background. You can verify:
```bash
# Open PowerShell as Administrator
Get-Service MongoDB
# Status should be "Running"
```

### Option B: Start MongoDB manually
```bash
mongod
```

### Option C: Using MongoDB Compass
Open MongoDB Compass → it will auto-connect to `localhost:27017`. If it connects, MongoDB is running.

---

## Step 4: Configure Environment (Optional)

The project comes with a `.env` file pre-configured:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/event-website
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | The port the server runs on | `5000` |
| `MONGODB_URI` | Your MongoDB connection string | `mongodb://localhost:27017/event-website` |

> **Note:** You only need to change these if your MongoDB runs on a different port or if port 5000 is already in use.

---

## Step 5: Start the Server

```bash
node server.js
```

You should see:
```
✅ Connected to MongoDB
🚀 Server is running on http://localhost:5000
```

---

## Step 6: Open the Dashboard

Open your browser and go to:

```
http://localhost:5000
```

### Access from your Phone (same Wi-Fi network)
1. Find your computer's local IP address:
   ```bash
   ipconfig
   ```
   Look for the **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.105`).

2. On your phone's browser, go to:
   ```
   http://192.168.1.105:5000
   ```

---

## Step 7: Clean Up Old Files (One-time)

If you see `index.html`, `style.css`, and `script.js` in the **root** folder (not inside `public/`), these are old files from version 1. Delete them:

```bash
del index.html style.css script.js
```

The server only serves files from the `public/` folder.

---

## Troubleshooting

### ❌ "Cannot connect to MongoDB"
- Make sure MongoDB is running (see Step 3)
- Check that the URI in `.env` matches your MongoDB setup
- Try connecting with MongoDB Compass first to verify

### ❌ "Port 5000 is already in use"
Change the PORT in `.env`:
```env
PORT=3000
```
Then restart the server and access `http://localhost:3000`.

### ❌ "npm install fails"
- Make sure Node.js is installed correctly
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again:
  ```bash
  rmdir /s /q node_modules
  del package-lock.json
  npm install
  ```

### ❌ Page shows "Failed to load teams"
- The server might not be running — check your terminal for errors
- Make sure you're visiting `http://localhost:5000` (not opening the HTML file directly)

---

> **You're all set!** Head back to [README.md](README.md) for usage instructions.
