# Troubleshooting Guide

## Common Issues

### API Routes Returning 404

**Symptom**: All `/api/codeforces/*` routes return 404 errors

**Cause**: Next.js 16 changed middleware to proxy, and the proxy was blocking requests

**Solution**: We've removed the middleware/proxy file. The application now works without rate limiting. If you need rate limiting in production, implement it at the API gateway level or use a service like Vercel's built-in rate limiting.

### Redis Connection Errors

**Symptom**: `Error: connect ECONNREFUSED ::1:6379`

**Cause**: Redis is not running locally

**Solution**: This is expected and normal. The application works perfectly without Redis. To enable Redis:
1. Install and start Redis locally
2. Uncomment `REDIS_URL` in `.env`
3. Restart the dev server

### Cannot read properties of undefined (reading 'charCodeAt')

**Symptom**: TypeScript/crypto errors in the console

**Cause**: Missing or invalid Codeforces API credentials

**Solution**: 
1. Get API credentials from https://codeforces.com/settings/api
2. Add them to `.env`:
   ```
   CF_API_KEY=your_key_here
   CF_API_SECRET=your_secret_here
   ```
3. Restart the dev server

### Dashboard Shows Error State

**Symptom**: Dashboard displays error message instead of data

**Possible Causes**:
1. Invalid Codeforces handle
2. Codeforces API is down
3. Rate limiting from Codeforces

**Solution**:
1. Try a different handle (e.g., "tourist", "Benq", "Petr")
2. Check https://codeforces.com/api/user.info?handles=tourist directly
3. Wait a few minutes if rate limited

### Development Server Won't Start

**Symptom**: `npm run dev` fails

**Solution**:
1. Delete `.next` folder: `rm -rf .next`
2. Delete `node_modules`: `rm -rf node_modules`
3. Reinstall: `npm install`
4. Try again: `npm run dev`

### Database Connection Errors

**Symptom**: Prisma errors about DATABASE_URL

**Solution**:
1. Ensure Prisma Postgres is running (check the Prisma extension in VS Code)
2. Verify `DATABASE_URL` in `.env` is correct
3. Run `npx prisma generate`
4. Run `npx prisma db push`

## Performance Tips

### Enable Redis for Better Performance

Redis significantly improves performance by caching API responses:

1. Install Redis:
   - **Windows**: Use WSL2 or Docker
   - **Mac**: `brew install redis && brew services start redis`
   - **Linux**: `sudo apt install redis-server && sudo systemctl start redis`

2. Update `.env`:
   ```
   REDIS_URL="redis://localhost:6379"
   ```

3. Restart dev server

### Optimize API Calls

The application uses React Query for intelligent caching. Data is automatically cached for:
- User info: 1 hour
- Problems: 24 hours
- Submissions: 30 minutes
- Rating history: 1 hour

## Getting Help

If you encounter issues not covered here:

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Check the [Codeforces API documentation](https://codeforces.com/apiHelp)
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)
