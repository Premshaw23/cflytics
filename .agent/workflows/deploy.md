---
description: How to deploy Codey to production (Vercel/Netlify)
---

This workflow guides you through deploying the Codey application.

### Prerequisites
1.  **Database**: A hosted PostgreSQL database (e.g., Supabase, Neon, or Railway).
2.  **Redis**: A hosted Redis instance (e.g., Upstash).
3.  **Codeforces Handle**: No API key is required generally, but check Codeforces API rules.

### Steps

1.  **Setup Environment Variables**
    Create a `.env` file or set these in your hosting provider:
    ```env
    DATABASE_URL="your_postgresql_connection_string"
    REDIS_URL="your_redis_url"
    NEXT_PUBLIC_APP_URL="https://your-domain.com"
    ```

2.  **Prepare the Database**
    // turbo
    Run prisma migrations to setup your schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Build the Application**
    // turbo
    Verify that the application builds correctly:
    ```bash
    npm run build
    ```

4.  **Deployment (Vercel - Recommended)**
    - Install Vercel CLI: `npm i -g vercel`
    - Login: `vercel login`
    - Deploy: `vercel --prod`

### Maintenance
- If you change the Prisma schema, remember to run `npx prisma db push` and `npx prisma generate` in your CI/CD pipeline.
