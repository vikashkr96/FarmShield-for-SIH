# 🚀 Vercel Frontend Deployment Guide (FarmShield)

This guide provides instructions to ensure seamless deployment to Vercel at `https://newproject-nu-gray.vercel.app/`.

---

## 🔍 How FarmShield Deploys on Vercel

The repository is configured to deploy the Next.js application in `frontend/` automatically via the root `vercel.json`:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs"
}
```

---

## 🛠️ Vercel Project Settings (Recommended)

1. Open your project in the **[Vercel Dashboard](https://vercel.com/dashboard)** (`new_project`).
2. Navigate to **Settings** ➔ **General**.
3. Under **Root Directory**, you can either:
   - Keep it as `./` (the root `vercel.json` automatically handles building `frontend/.next`).
   - Or set **Root Directory** to `frontend` (standard Next.js preset).
4. Go to **Deployments** ➔ Click the three dots `...` next to the latest deployment ➔ Click **Redeploy**.

---

## ⚙️ Environment Variables on Vercel

In **Project Settings** ➔ **Environment Variables**, ensure you have:

| Variable | Description | Example / Recommended |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | `eyJhbGci...` |
| `NEXT_PUBLIC_APP_URL` | Vercel Deployment URL | `https://newproject-nu-gray.vercel.app` |
