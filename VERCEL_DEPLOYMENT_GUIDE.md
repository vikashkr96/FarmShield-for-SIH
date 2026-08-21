# 🚀 Vercel Frontend Deployment Guide (FarmShield)

This guide resolves the `"No Next.js version detected"` warning on Vercel.

---

## 🔍 Why this happens
Your repository contains both `frontend/` (Next.js) and `backend/` (Node Express). By default, Vercel looks at the root of the repository.

---

## 🛠️ How to Fix in Vercel Dashboard (Option 1 - Recommended)

1. Open your project in the **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click on **Settings** (top navigation tab) ➔ **General**.
3. Scroll to **Root Directory**.
4. Click **Edit**, type or select **`frontend`**, and click **Save**.
5. Go to **Deployments** (top tab) ➔ Click the three dots `...` next to the latest deployment ➔ Click **Redeploy**.

---

## ⚙️ Environment Variables on Vercel

In **Project Settings** ➔ **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-service.onrender.com` | Your Render Backend API URL |

---

## 📦 Project Directory Settings Summary

- **Framework Preset:** `Next.js`
- **Root Directory:** `frontend`
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)
