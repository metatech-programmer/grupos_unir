# Quick Reference — Common Commands and Structure

## Development Commands

```bash
# Start development server
npm run dev

# Access application
# Navigate to http://localhost:3000
```

## Build and Production

```bash
# Create production build
npm run build

# Run production version
npm start

# Check for errors
npm run lint
```

## Folder Structure

```
grupos/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   │   ├── page.tsx      # Homepage
│   │   ├── register/     # Registration page
│   │   ├── login/        # Login page
│   │   ├── dashboard/    # Main dashboard
│   │   ├── explore/      # Browse groups
│   │   └── groups/[id]/  # Group details
│   ├── lib/              # Shared utilities
│   │   ├── supabase.ts   # Database client
│   │   ├── ai-matching.ts # Matching algorithm
│   │   └── timezones.ts  # Timezone utilities
│   ├── components/       # Reusable components
│   └── app/globals.css   # Global styles
├── .env.local           # Credentials (do not commit)
├── README.md            # Full documentation
├── GETTING_STARTED.md   # Setup guide
├── QUICK_START.md       # Quick reference
├── ARCHITECTURE.md      # System design
├── SETUP.sql            # Database schema
└── package.json         # Dependencies
```

## Environment Variables

```env
# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Main Dependencies

- **Next.js 15**: React framework
- **React 18**: UI library
- **Supabase**: Database and authentication
- **Tailwind CSS**: Styling utility
- **TypeScript**: Type safety

## Setup Checklist

- [ ] Create Supabase project
- [ ] Execute SETUP.sql in Supabase
- [ ] Copy credentials from Supabase
- [ ] Create `.env.local` with credentials
- [ ] Run `npm install` (if needed)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Register and test functionality

## Deploy to Vercel

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/grupos
git push -u origin main
```

2. On vercel.com:
   - Click "New Project"
   - Select repository
   - Add environment variables
   - Click "Deploy"

## Documentation Files

- **README.md**: Complete documentation and features
- **GETTING_STARTED.md**: Step-by-step setup
- **QUICK_START.md**: Quick reference guide
- **ARCHITECTURE.md**: Cómo funciona internamente todo
- **SETUP.sql**: Código SQL de la base de datos

---

**Última actualización: Marzo 2026**
