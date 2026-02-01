# Codeforces Problem Scraper

This script scrapes problem statements from Codeforces and stores them in the database for fast, reliable access.

## Usage

### Scrape a limited number of problems (for testing):
```bash
npx ts-node scripts/scrape-problems.ts 10
```

### Scrape all problems (takes several hours):
```bash
npx ts-node scripts/scrape-problems.ts
```

## Important Notes

1. **Run locally, not in production** - This script should be run on your local machine, not on Vercel or other hosting platforms.

2. **Respectful delays** - The script includes 2-3 second delays between requests to respect Codeforces' servers.

3. **Resume capability** - The script checks if a problem already exists in the database before scraping, so you can stop and resume at any time.

4. **Expected duration** - Scraping all ~8000 problems takes approximately 5-6 hours with the built-in delays.

5. **Cloudflare protection** - If you encounter many failures, try:
   - Running during off-peak hours
   - Using a VPN if your IP is rate-limited
   - Increasing delays between requests

## Workflow

1. **Initial scrape** (one-time):
   ```bash
   npx ts-node scripts/scrape-problems.ts 50
   ```
   Test with 50 problems first to ensure everything works.

2. **Full scrape** (run overnight):
   ```bash
   npx ts-node scripts/scrape-problems.ts
   ```

3. **Periodic updates** (monthly):
   ```bash
   npx ts-node scripts/scrape-problems.ts 100
   ```
   Scrape recent problems to keep the database current.

## After Scraping

Once problems are in the database:
- Problem pages load instantly from the database
- No more 403 Forbidden errors
- Works reliably in production
- No runtime scraping needed

## Troubleshooting

**Error: "Cloudflare protection detected"**
- Wait a few hours and try again
- Use a VPN to change your IP
- Reduce the number of problems per session

**Error: "Problem statement not found"**
- Some problems may have restricted access
- The script will skip these and continue

**Database connection errors**
- Ensure your `.env` file has the correct `DATABASE_URL`
- Check that the database is accessible
