# Getting Started - Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- GitHub account (optional)
- Supabase account (free at supabase.com)

---

## Setup Steps (5-10 minutes)

### Step 1: Create Supabase Project
1. Navigate to https://supabase.com in your browser
2. Click **"Start your project"** or **"Sign In"**
3. Create an account using GitHub (fastest option)
4. Click **"New Project"**
   - Name: `grupos`
   - Password: Choose any secure password
   - Region: Select the closest region to you
5. Wait 2-3 minutes for the project to be created

### Step 2: Set Up Database
1. In Supabase, navigate to **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Open [SETUP.sql](./SETUP.sql) in your text editor
4. Copy all the SQL code
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (green button)
7. The database is now configured

### Step 3: Obtain Credentials
1. In Supabase, navigate to **"Settings"** in the left sidebar
2. Select **"API"**
3. Copy the following values:
   ```
   Project URL:  https://xxxxxxxxxxxx.supabase.co
   anon public:  eyJhbGc...xxxxx
   ```

### Step 4: Configure Local Environment
1. Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
   ```
   *Replace these values with credentials from Step 3*

2. Open Terminal in the project directory
3. Run:
   ```bash
   npm run dev
   ```

4. Navigate to http://localhost:3000 in your browser
5. The application is now running

---

## Testing the Application

### Create an Account
1. Click **"Register"**
2. Fill in the following information:
   - Name: Your name
   - Email: your-email@example.com
   - Country: Your country
   - Timezone: Your timezone
   - Password: Your password
3. Click **"Register"**

### Explore Groups
1. You will see the Dashboard
2. Click **"Explore Groups"**
3. The AI recommends groups based on:
   - Advantages
   - Disadvantages
   - Compatibility percentage
4. Click **"Join This Group"**
5. Complete


---

## Deploy to Vercel (Free)

### Option A: Using GitHub (Recommended)
```bash
# In the terminal, in the project directory:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/grupos.git
git push -u origin main
```

Then:
1. Go to https://vercel.com
2. Click **"New Project"**
3. Select your "grupos" repository
4. Click **"Import"**
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your key
6. Click **"Deploy"**
7. Your application is now live on the internet

### Option B: Direct Vercel Upload
1. Go to https://vercel.com
2. Click **"New Project"**
3. Upload this folder as a zip file
4. Configure environment variables
5. Deploy

---

## Sample Test Data

To add example groups, run this in the Supabase SQL Editor:

```sql
INSERT INTO groups (name, subject, max_size, timezone_coverage, pros, cons) VALUES
('Backend Team', 'Programming', 5, 
 ARRAY['Europe/Madrid'], 
 ARRAY['Same location', 'Excellent coordination'], 
 ARRAY[]),

('Global Team', 'English', 4, 
 ARRAY['Europe/Madrid', 'America/Bogota'], 
 ARRAY['Multicultural', 'Language learning'], 
 ARRAY['Complex schedules']);
```

---

## Key Features

| Feature | Status |
|---------|--------|
| Register/Login | Working |
| Database | Supabase PostgreSQL |
| AI Recommendations | Intelligent matching |
| Real-time Updates | WebSocket |
| Pros/Cons Display | Per group |
| Timezone Support | 15+ countries |
| Responsive Design | Mobile friendly |
| Cost | 100% free |

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "NEXT_PUBLIC_SUPABASE_URL not found" | Verify `.env.local` exists and has correct values |
| "Cannot connect to database" | Double-check Supabase credentials |
| "Blank page" | Press F12, check Console for error messages |
| "Port 3000 already in use" | Run `npm run dev -- -p 3001` |
| "Build failed" | Run `npm run build` to see detailed errors |

---

## Additional Resources

- [README.md](./README.md) - Complete documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SETUP.sql](./SETUP.sql) - Database schema
- [QUICK_START.md](./QUICK_START.md) - Alternative quick guide

---

## Learning Resources

- **Next.js**: https://nextjs.org/learn
- **Supabase**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com
- **React**: https://react.dev

---

## Next Steps (Optional)

After the application is working:
1. Customize colors in `tailwind.config.ts`
2. Add more countries in `src/lib/timezones.ts`
3. Upload your logo to `public/logo.png`
4. Create your first group in the database
5. Invite colleagues to join

---

## Tips

- Use **Incognito mode** to simulate multiple users
- View data in Supabase **Table Editor**
- Passwords are automatically hashed
- Database is free up to 500k rows
- Vercel is free for small projects
