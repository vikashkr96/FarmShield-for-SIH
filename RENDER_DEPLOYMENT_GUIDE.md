# 🚀 How to Deploy FarmShield Backend on Render (Free Tier)

This guide provides step-by-step instructions to host the **FarmShield Backend API** on [Render.com](https://render.com).

---

## 🎯 Quick Configuration Summary

| Setting | Value |
| :--- | :--- |
| **Service Type** | **Web Service** |
| **Repository** | `https://github.com/vikashkr96/FarmShield-for-SIH-` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |
| **Instance Type** | `Free` |

---

## 📋 Step-by-Step Deployment Guide

### Option 1: Manual Web Service Setup (Recommended - 2 Minutes)

1. **Sign in to Render:**
   - Go to [https://dashboard.render.com/](https://dashboard.render.com/) and sign in with your GitHub account.

2. **Create New Web Service:**
   - Click **`New +`** in the top right corner.
   - Select **`Web Service`**.

3. **Connect Your GitHub Repository:**
   - Select `vikashkr96/FarmShield-for-SIH-` (or paste your repo URL).
   - Click **`Connect`**.

4. **Configure Service Details:**
   - **Name:** `farmshield-backend-api` (or any name you prefer)
   - **Region:** `Singapore` (Fastest for India) or `Oregon`
   - **Branch:** `main`
   - **Root Directory:** `backend` *(⚠️ Very Important! Must be `backend`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

5. **Set Environment Variables:**
   - Scroll down to the **Environment Variables** section and click **`Add Environment Variable`**:

   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGIN` | `*` |
   | `PORT` | `10000` *(Render sets this automatically, but good to add)* |
   | `SUPABASE_URL` | *(Optional: your Supabase project URL)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(Optional: your Supabase service role key)* |

6. **Deploy:**
   - Click **`Create Web Service`**.
   - Render will clone the repository, install dependencies, compile TypeScript (`tsc`), and start the Express server!

7. **Verify Deployment:**
   - Once the deploy log shows `🚀 FarmSheild Express API Server running`, copy your live Render URL (e.g. `https://farmshield-backend-api.onrender.com`).
   - Test in your browser:
     - Root: `https://farmshield-backend-api.onrender.com/`
     - Health Check: `https://farmshield-backend-api.onrender.com/api/health`
     - Animals List: `https://farmshield-backend-api.onrender.com/api/animals`

---

### Option 2: 1-Click Blueprint Deploy (Using `render.yaml`)

Because we added `render.yaml` to the root of your repo, you can also deploy via Blueprints:

1. In Render Dashboard, click **`New +`** ➔ **`Blueprint`**.
2. Select `vikashkr96/FarmShield-for-SIH-`.
3. Render will read `render.yaml` and configure everything automatically.
4. Click **`Apply`** to launch!

---

## 🔗 Connecting Frontend to your Render Backend

Once your backend is live on Render:
1. In your frontend configuration or `.env.local`:
   ```ini
   NEXT_PUBLIC_API_URL=https://farmshield-backend-api.onrender.com
   ```
2. Any frontend hosted on **Vercel** or **localhost:3000** will immediately communicate with your live Render backend without CORS errors!
