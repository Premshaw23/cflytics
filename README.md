# Codey 🚀

Advanced Codeforces Dashboard & Analytics Platform built with Next.js, Tailwind CSS, and Prisma.

## ✨ Features (Planned)
- **Advanced Analytics:** Deep dive into your Codeforces performance with interactive charts.
- **Problem Recommendation:** Get personalized problem suggestions based on your rating and weak areas.
- **Contest Tracking:** Keep track of upcoming and past contests with countdowns and analytics.
- **Performance Insights:** Analyze your submission history, verdict distribution, and more.
- **User Comparison:** Compare your progress with friends side-by-side.
- **Goal Setting:** Set personalized goals and track your progress.
- **Dark Mode:** Sleek and modern UI with full dark mode support.

## 🛠️ Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Database:** Prisma with PostgreSQL/MySQL
- **Caching:** Redis
- **Charts:** Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Redis (local or cloud)
- A database (PostgreSQL/MySQL)

### Installation
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
   Create a `.env` file in the root and add your configuration.
   ```env
   DATABASE_URL="your-database-url"
   REDIS_URL="your-redis-url"
   ```

4. Initialize Prisma:
   ```bash
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📈 Implementation Plan
See [codey-weekwise-plan.md](./codey-weekwise-plan.md) for the detailed 15-week roadmap.
