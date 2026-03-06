# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables set in `.env.local`
- [ ] Supabase database initialized with tables
- [ ] Groq API key valid and active
- [ ] Redis connection tested
- [ ] Local build succeeds: `npm run build`
- [ ] All tests pass
- [ ] Documentation content migrated and verified

## Environment Variables

Create a `.env.local` file (for development) or set these in your Vercel project settings:

```bash
# Groq AI Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://xxx-xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx_xxx_xxx
```

## Local Development

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

### 2. Setup Environment
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/docs` in your browser.

### 4. Build Locally
```bash
npm run build
npm start
```

## Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the repository

### 2. Configure Project Settings
1. **Framework**: Next.js (auto-detected)
2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`
4. **Environment Variables**: Add all vars from `.env.local`

### 3. Set Environment Variables in Vercel
```bash
GROQ_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

## Production Optimizations

### 1. Enable Incremental Static Regeneration (ISR)

Add to `app/docs/[slug]/page.tsx`:
```typescript
export const revalidate = 3600; // Revalidate every hour
```

### 2. Configure Caching Headers

Create `middleware.ts`:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Cache static assets
  if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|svg|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Cache doc pages
  if (request.nextUrl.pathname.startsWith('/docs/')) {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico).*)',
  ],
};
```

### 3. Database Connection Pooling

Supabase automatically handles connection pooling. Monitor usage in the Supabase dashboard.

### 4. Redis Connection Pooling

Upstash Redis uses HTTP for serverless compatibility. Monitor usage in Upstash console.

### 5. Image Optimization

Use Next.js Image component for all images:
```typescript
import Image from 'next/image';

<Image
  src="/logo/light.svg"
  alt="Hestia Labs"
  width={40}
  height={40}
  priority
/>
```

## Monitoring & Analytics

### Vercel Analytics
Enable in `next.config.mjs`:
```javascript
module.exports = {
  experimental: {
    webVitals: true,
  },
};
```

### Supabase Monitoring
- Check query performance in Supabase dashboard
- Monitor index usage for full-text search
- Archive old conversation messages regularly

### Upstash Monitoring
- Monitor cache hit rate
- Review command latency
- Set up alerts for high latency

## Troubleshooting

### Build Failures

1. **Check Node version**: `node --version` (use Node 18+)
2. **Clear cache**: `npm cache clean --force`
3. **Reinstall**: `rm -rf node_modules && npm install`
4. **Check logs**: Review build logs in Vercel dashboard

### Runtime Errors

1. **Check environment variables**: Verify all vars are set
2. **Check API keys**: Ensure Groq key is valid
3. **Check database**: Verify Supabase connection
4. **Check Redis**: Verify Upstash connection

### Performance Issues

1. **Check cache hit rate**: Use Redis CLI to inspect cache
2. **Check database queries**: Monitor Supabase slow query log
3. **Check bundle size**: Run `npm run build` and check `.next/static`
4. **Check API latency**: Monitor Groq API response times

## Maintenance

### Weekly
- Monitor error rates
- Review cache hit rates
- Check database connection pool

### Monthly
- Archive old conversation messages
- Review and optimize slow queries
- Update dependencies

### Quarterly
- Full backup of Supabase
- Review and update security policies
- Performance analysis and optimization

## Scaling

As traffic increases:

1. **Increase Upstash tier** for higher cache capacity
2. **Increase Supabase plan** for higher rate limits
3. **Enable edge caching** for static content
4. **Use read replicas** for high-traffic deployments

## Custom Domain

1. Add domain in Vercel project settings
2. Add CNAME record to your DNS provider
3. Verify domain ownership
4. Enable automatic HTTPS

## Rollback Procedure

If a deployment has issues:

1. Go to Vercel dashboard
2. Navigate to "Deployments"
3. Find the previous working deployment
4. Click "..." → "Promote to Production"
5. Wait for deployment to complete

## Security Checklist

- [ ] No API keys in code (use environment variables)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CORS if needed
- [ ] Enable rate limiting (Vercel + Supabase)
- [ ] Enable database backups (Supabase)
- [ ] Monitor for security updates
- [ ] Enable audit logging (Supabase)
- [ ] Use strong Supabase credentials

## Support

For deployment issues:
1. Check [Vercel docs](https://vercel.com/docs)
2. Check [Supabase docs](https://supabase.com/docs)
3. Check [Groq docs](https://console.groq.com/docs)
4. Check [Upstash docs](https://upstash.com/docs)
5. Open an issue on GitHub
