# 🚀 Deploying INNOVATIA on Vercel (Step-by-Step)

Since your app uses MongoDB, you can't use local MongoDB in production. You'll use **MongoDB Atlas** (free cloud database) + **Vercel** (free hosting).

---

## Step 1: Create MongoDB Atlas Account (Free)

1. Go to **[https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)**
2. Click **"Try Free"** → Sign up with Google or email
3. Choose the **FREE** plan (M0 Sandbox — 512MB, completely free)

---

## Step 2: Create a Cluster

1. After signing in, click **"Build a Database"**
2. Select **M0 FREE** tier
3. Choose a cloud provider — pick **AWS**
4. Choose region — pick **Mumbai (ap-south-1)** for best speed in India
5. Cluster name: leave as `Cluster0` or name it `innovatia`
6. Click **"Create Deployment"**

---

## Step 3: Set Up Database Access

A popup will ask you to create a database user:

1. **Username**: `innovatia-admin` (or anything you want)
2. **Password**: Click **"Autogenerate Secure Password"**
3. **⚠️ COPY THIS PASSWORD** — you'll need it in Step 5
4. Click **"Create Database User"**

---

## Step 4: Allow Access From Anywhere

1. In the same popup (or go to **Security → Network Access**)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** → This sets it to `0.0.0.0/0`
4. Click **"Confirm"**

> ⚠️ This is required for Vercel to connect since Vercel's IP changes on every request.

---

## Step 5: Get Your Connection String

1. Go to **"Database"** in the sidebar → Click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. You'll see a connection string like this:

```
mongodb+srv://innovatia-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

```
mine:
mongodb+srv://innovatia-admin:<db_password>@cluster0.sryophf.mongodb.net/?appName=Cluster0
```

4. **Replace `<password>`** with the password you copied in Step 3
5. **Add your database name** before the `?`:

```
mongodb+srv://innovatia-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/innovatia?retryWrites=true&w=majority
```

6. **Copy this full string** — this is your `MONGODB_URI`

---

## Step 6: Test Locally with Atlas (Optional but Recommended)

Before deploying, test that Atlas works locally:

1. Open your `.env` file and replace the old URI:

```env
PORT=5000
MONGODB_URI=mongodb+srv://innovatia-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/innovatia?retryWrites=true&w=majority
```

2. Run `node server.js`
3. If you see `✅ Connected to MongoDB` — Atlas is working!
4. Open `http://localhost:5000` and test adding a team

---

## Step 7: Push Changes to GitHub

Make sure these new files are committed:

```bash
cd c:\Users\Utkarsh\OneDrive\Desktop\clg\event-website

git add .
git commit -m "Add Vercel deployment config"
git push
```

Your repo should now have these files:
```
├── vercel.json          ← NEW (tells Vercel how to deploy)
├── .gitignore           ← NEW (keeps .env out of GitHub)
├── server.js            ← UPDATED (Vercel-compatible)
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── package.json
└── ...
```

> ⚠️ Make sure `.env` is NOT pushed to GitHub (it has your password!)

---

## Step 8: Deploy on Vercel

1. Go to **[https://vercel.com](https://vercel.com)**
2. Click **"Sign Up"** → Sign in with **GitHub**
3. Click **"Add New..."** → **"Project"**
4. Find your `event-website` repo → Click **"Import"**
5. On the configuration page:
   - **Framework Preset**: Select **"Other"**
   - **Root Directory**: Leave as `./`
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty

6. Expand **"Environment Variables"** section
7. Add this variable:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://innovatia-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/innovatia?retryWrites=true&w=majority` |

8. Click **"Deploy"**

---

## Step 9: Wait for Deployment ✅

- Vercel will build and deploy your app in ~30 seconds
- Once done, you'll get a URL like: `https://event-website-abc123.vercel.app`
- Open it → You should see the INNOVATIA dashboard!

---

## Step 10: Test Sync Across Devices

1. Open the Vercel URL on your **laptop browser**
2. Open the same URL on your **phone browser**
3. On one device: unlock admin → add a team
4. On the other device: **the team should appear within 2 seconds** 🔄

**The sync works because:**
- Both devices poll the same cloud database (MongoDB Atlas)
- Every 2 seconds, each device fetches from `/api/teams`
- If data changed, the UI re-renders automatically

---

## Troubleshooting

### ❌ "Database connection failed" on Vercel
- Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
- Make sure `MONGODB_URI` is set correctly (no extra spaces!)
- Check that the password is correct (no `<` `>` brackets)
- In MongoDB Atlas: verify **Network Access** allows `0.0.0.0/0`

### ❌ Build fails on Vercel
- Make sure `vercel.json` is in the root of your repo
- Make sure `package.json` lists all dependencies
- Check the Vercel build logs for specific errors

### ❌ API works but page is blank
- Make sure `public/` folder with all 3 files is pushed to GitHub
- Check Vercel logs: **Deployments** → click latest → **"Functions"** tab

### ❌ Data not syncing between devices
- Both devices must be using the Vercel URL (not localhost)
- Check the green sync dot is visible on both devices
- Open browser DevTools (F12) → Console → look for fetch errors

---

## Custom Domain (Optional)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., `innovatia.yourname.com`)
3. Follow Vercel's DNS setup instructions
4. Free SSL is included automatically!

---

## Summary

| What | Where |
|------|-------|
| Code | GitHub (your repo) |
| Backend | Vercel Serverless Functions |
| Database | MongoDB Atlas (free M0 tier) |
| Frontend | Vercel Static + CDN |
| Sync | 2s polling — same DB for all users |
| Cost | **$0** (completely free!) |

---

> **You're live!** Share your Vercel URL with professors and students. Everyone sees the same data, synced every 2 seconds. 🎉
