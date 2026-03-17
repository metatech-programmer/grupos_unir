# Grupos — Intelligent Team Organization Platform

A web application for creating optimized work groups based on timezone compatibility and user preferences.

## Overview

Grupos helps students and professionals organize into study or project groups with matching schedules and geographic diversity. The AI-powered matching algorithm recommends the best group for each user based on timezone overlap, group size preferences, available spaces, and diversity metrics.

## Getting Started

**Quick start**: Read [GETTING_STARTED.md](./GETTING_STARTED.md) for step-by-step setup instructions.

For complete architecture details, see [ARCHITECTURE.md](./docs/archived-md/ARCHITECTURE.md).

## Security

- **Important**: Never commit `.env.local` — it contains sensitive credentials
- License: MIT (see [LICENSE](./LICENSE))

## Compatibility Scoring Algorithm

The matching algorithm evaluates groups using the following weighted criteria:

- **Timezone Compatibility (25 points)**: Does the group's timezone overlap within 8 hours?
- **Schedule Overlap (25 points)**: How many hours of daily overlap exist between user and group?
- **Daily Hours Match (20 points)**: Does the required daily commitment align with user availability?
- **Work Style Compatibility (15 points)**: Does the group's work style match user preferences?
- **Shared Activities (15 points)**: How many activity interests are shared?
- **Group Size Preference (5 points)**: Groups with 2-4 members score higher
- **Available Spaces (5 points)**: Groups with open slots score higher

**Final Score: 0-100 points**

## Deployment to Vercel

### Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Import to Vercel
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Select your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

Your application will be live within minutes.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Main layout component
│   ├── register/page.tsx      # Registration page
│   ├── login/page.tsx         # Login page
│   ├── dashboard/page.tsx     # User dashboard
│   ├── explore/page.tsx       # Browse groups
│   └── groups/[id]/page.tsx   # Group details
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── timezones.ts          # Timezone utilities
│   └── ai-matching.ts        # Matching algorithm
├── components/               # Reusable React components
└── styles/                   # Additional stylesheets
```

## Security

- Authentication via Supabase Auth (secure and free)
- Row Level Security (RLS) enforced in database
- Environment variables protected
- Passwords never stored in localStorage

## Features

- AI-powered group recommendations
- Real-time timezone-based matching
- Multi-country support (15+ countries)
- Pros and cons display for each group
- Free PostgreSQL database via Supabase
- Free deployment via Vercel
- Responsive mobile design

## Future Enhancements

- [ ] Create custom groups
- [ ] Change groups by subject
- [ ] Group rating system
- [ ] Google Meet/Discord integration
- [ ] Real-time notifications
- [ ] Direct messaging between members
- [ ] Dashboard analytics

## Troubleshooting

### Authentication Error
- Verify environment variables are correctly configured
- Confirm your Supabase project is active

### Group Failed to Load
- Check browser console for error messages
- Ensure `groups` table exists in Supabase

### Timezone Incorrect
- Supabase stores times in UTC internally
- The algorithm automatically converts to local timezone

## Support

For issues or questions:
1. Review [Next.js documentation](https://nextjs.org)
2. Consult [Supabase documentation](https://supabase.com/docs)
3. Open an issue in this repository

## License

MIT License - Free for personal and commercial projects.

---

## Supported Timezones

The platform supports the following timezones and regions:

| Country | Timezone | UTC Offset |
|---------|----------|-----------|
| Spain | Europe/Madrid | UTC+1 |
| Colombia | America/Bogota | UTC-5 |
| Peru | America/Lima | UTC-5 |
| Argentina | America/Argentina/Buenos_Aires | UTC-3 |
| Brazil | America/Sao_Paulo | UTC-3/-2 |
| Mexico | America/Mexico_City | UTC-6/-5 |
| Chile | America/Santiago | UTC-3/-4 |
| Uruguay | America/Montevideo | UTC-3 |
| Venezuela | America/Caracas | UTC-4 |
| Ecuador | America/Guayaquil | UTC-5 |
| Dominican Republic | America/Santo_Domingo | UTC-4 |
| United Kingdom | Europe/London | UTC+0 |
| France | Europe/Paris | UTC+1/+2 |
| Germany | Europe/Berlin | UTC+1/+2 |
| India | Asia/Kolkata | UTC+5:30 |

## Project Requirements Met

- Maximum group size: 3-5 members
- Timezone-aware scheduling
- AI-powered matching recommendations
- Free database (Supabase PostgreSQL)
- Real-time synchronization (Supabase Realtime)
- Free deployment (Vercel)
- Pros and cons display per group
- User choice override (ignore AI recommendations if desired)
