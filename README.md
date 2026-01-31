# Codey - Advanced Codeforces Dashboard & Analytics Platform

An advanced analytics and tracking platform for Codeforces competitive programmers.

## 🚀 Features

- **Real-time Analytics**: Track your Codeforces performance with live data
- **Advanced Insights**: Topic weakness identification and rating projections
- **Problem Explorer**: Browse and filter 8000+ problems by tags, difficulty, and more
- **User Comparison**: Compare progress with friends side-by-side
- **Dashboard Overview**: Comprehensive stats on problems solved, rating, contests, and streaks
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Styling**: Tailwind CSS 4
- **Database**: Prisma 6 with PostgreSQL (Neon)
- **Caching**: Redis (Upstash/ioredis)
- **State Management**: React Query + Zustand
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/codey.git
cd codey
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example env
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string (Neon recommended)
- `REDIS_URL`: (Optional) Your Redis connection string (Upstash recommended)
- `CF_API_KEY` & `CF_API_SECRET`: Get from https://codeforces.com/settings/api

4. Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Running Tests

The project uses Vitest for unit and component testing.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard pages (Problems, Analytics, etc.)
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── analytics/         # Insight-focused charts and components
│   ├── dashboard/         # Dashboard layout and summary components
│   ├── shared/            # Reusable UI elements
│   └── ui/                # shadcn/ui base components
├── lib/                   # Utilities and helpers
│   ├── api/               # API wrappers (Codeforces)
│   ├── hooks/             # Custom React hooks (Data fetching)
│   └── utils/             # Business logic and formatting
├── config/                # Site metadata and constants
└── types/                 # TypeScript interfaces
```

## 🎯 Project Evolution (Roadmap)

- [x] **Weeks 1-3**: Infrastructure & Foundation
- [x] **Weeks 4-6**: Core Dashboard & Charts
- [x] **Weeks 7-9**: Advanced Problem Filters & Comparison
- [x] **Weeks 10-12**: User Goals, Heatmaps & Polish
- [x] **Weeks 13-14**: Advanced Insights, Testing & SEO
- [x] **Week 15**: Deployment & Final Launch Documentation

## 📝 License

MIT License - see LICENSE file for details

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
