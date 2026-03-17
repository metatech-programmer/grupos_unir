# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Create Free Supabase Project
1. Visit https://supabase.com
2. Click **"Start your project"**
3. Create account using GitHub (fastest option)
4. Create new project named "grupos"
5. Wait 2-3 minutes for setup

### Step 2: Configure Database
1. In your project, navigate to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy all SQL code from [SETUP.sql](./SETUP.sql)
4. Click **"Run"**
5. Database is ready

### Step 3: Get Credentials
1. Open **Settings > API** (left sidebar)
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Set Environment Variables
1. Copy `.env.example` file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and paste:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   ```

### Step 5: Run Locally
```bash
npm run dev
```

Visit http://localhost:3000 — Your app is running!
