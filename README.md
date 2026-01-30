# Codey - Advanced Codeforces Dashboard & Analytics Platform

An advanced analytics and tracking platform for Codeforces competitive programmers.

## 🚀 Features

- **Real-time Analytics**: Track your Codeforces performance with live data
- **Problem Explorer**: Browse and filter 8000+ problems by tags, difficulty, and more
- **Dashboard Overview**: Comprehensive stats on problems solved, rating, contests, and streaks
- **Smart Caching**: Optional Redis integration for improved performance
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS 4
- **Database**: Prisma 7 with PostgreSQL
- **Caching**: Redis (optional)
- **State Management**: React Query + Zustand
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts

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
cp .env.example .env
```

Edit `.env` and add your configuration:
- `DATABASE_URL`: Your PostgreSQL connection string
- `REDIS_URL`: (Optional) Your Redis connection string
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

## 🔧 Configuration

### Redis (Optional)

Redis is used for caching API responses and rate limiting. The application works perfectly without Redis, but enabling it improves performance:

- **With Redis**: Uncomment `REDIS_URL` in `.env`
- **Without Redis**: Leave `REDIS_URL` commented out (default)

### Codeforces API

To get higher rate limits, register for API credentials:
1. Visit https://codeforces.com/settings/api
2. Generate API Key and Secret
3. Add them to your `.env` file

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── shared/            # Shared/reusable components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities and helpers
│   ├── api/               # API wrappers
│   ├── db/                # Database clients
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
├── config/                # Configuration files
└── types/                 # TypeScript type definitions
```

## 🎯 Roadmap

- [x] Week 1: Project Setup & Foundation
- [x] Week 2: Core Infrastructure & API
- [x] Week 3: Landing Page & Layout
- [x] Week 4: Dashboard Overview
- [x] Week 5: Problem Explorer
- [ ] Week 6: Contest Tracking & Charts
- [ ] Week 7: User Comparison
- [ ] Week 8: Bookmarks & Notes
- [ ] Week 9: Goal Setting
- [ ] Week 10: Testing & Optimization
- [ ] Week 11: Deployment
- [ ] Week 12: Polish & Documentation

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.
