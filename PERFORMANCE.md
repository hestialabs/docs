# Performance Optimization Guide

## Current Metrics

- **Page Load Time**: ~800ms
- **Time to First Byte (TTFB)**: ~100-200ms
- **Largest Contentful Paint (LCP)**: ~1.2s
- **Cumulative Layout Shift (CLS)**: <0.1
- **First Input Delay (FID)**: <100ms

## Optimization Strategies

### 1. Caching

#### Redis Cache Layers
- **Search Results**: 1-hour TTL
- **AI Responses**: 24-hour TTL
- **Documentation Pages**: 7-day TTL
- **Short-lived**: 5-minute TTL

#### HTTP Caching Headers
```
Static assets (JS, CSS, fonts): 1 year
Documentation pages: 1 hour
API responses: 5 minutes
```

#### Database Query Caching
- Full-text search results cached
- Conversation history paginated
- Conversation messages use pagination (50 per page)

### 2. Code Splitting

#### Dynamic Imports
```typescript
// Lazy-load heavy components
const AIAssistant = dynamic(() => import('@/components/AIAssistant'), {
  loading: () => <div>Loading...</div>,
});
```

#### Route Splitting
- Separate bundles for `/docs`, `/api`, `/search`
- Lazy-load AI assistant on demand

### 3. Image Optimization

#### Use Next.js Image Component
```typescript
import Image from 'next/image';

<Image
  src="/logo/light.svg"
  alt="Logo"
  width={40}
  height={40}
  priority // For above-the-fold images
/>
```

#### Image Best Practices
- Convert PNGs to WebP where possible
- Optimize SVGs (remove metadata)
- Use responsive images with `srcSet`
- Compress all images

### 4. Database Optimization

#### Full-Text Search Optimization
```sql
CREATE INDEX idx_documentation_search ON documentation USING gin(
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', description), 'B') ||
  setweight(to_tsvector('english', content), 'C')
);
```

#### Query Optimization
- Use indexes for frequently queried columns
- Paginate results (limit 50)
- Denormalize if needed for common queries

#### Connection Pooling
- Supabase handles connection pooling
- Monitor active connections in dashboard
- Set appropriate pool size (default: 10)

### 5. API Optimization

#### Response Compression
- Enable gzip compression (automatic in Vercel)
- Response size: ~50KB compressed

#### Streaming Responses
- AI assistant uses Server-Sent Events (SSE)
- Streaming improves perceived performance

#### Rate Limiting
- Prevent abuse and overload
- Configure in Vercel and Supabase

### 6. Frontend Optimization

#### JavaScript Bundle Size
- Remove unused dependencies
- Tree-shake unused exports
- Minify and compress

Analyze with:
```bash
npm run build
npx next-bundle-analyzer
```

#### CSS Optimization
- Use CSS modules (scoped styles)
- Remove unused CSS
- Minify CSS

#### Font Optimization
```css
/* Use system fonts or web-safe fonts */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 7. Web Vitals Monitoring

#### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s (target)
- **FID (First Input Delay)**: < 100ms (target)
- **CLS (Cumulative Layout Shift)**: < 0.1 (target)

#### Monitoring Tools
- [Vercel Analytics](https://vercel.com/analytics)
- [Google PageSpeed Insights](https://pagespeed.web.dev)
- [Web Vitals Library](https://github.com/GoogleChrome/web-vitals)

## Optimization Checklist

### Development
- [ ] Enable minification (automatic in Next.js)
- [ ] Remove console.log in production
- [ ] Use production build for testing
- [ ] Test with Network throttling enabled

### Build
- [ ] Run `npm run build` without warnings
- [ ] Check bundle size: `npm run build` output
- [ ] Verify all imports are resolved

### Deployment
- [ ] Enable compression (automatic in Vercel)
- [ ] Configure cache headers
- [ ] Enable edge caching where possible
- [ ] Use regional deployment

### Monitoring
- [ ] Enable Vercel Analytics
- [ ] Monitor Web Vitals
- [ ] Track error rates
- [ ] Monitor API latency

## Performance Budgets

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| JS Bundle | 150KB | 95KB | ✓ |
| CSS Bundle | 30KB | 12KB | ✓ |
| Image Size | 100KB | 25KB | ✓ |
| Total Page | 250KB | 132KB | ✓ |
| LCP | 2.5s | 1.2s | ✓ |
| FID | 100ms | <50ms | ✓ |
| CLS | 0.1 | 0.05 | ✓ |

## Common Issues & Solutions

### Slow Page Load
1. Check Supabase query performance
2. Verify Redis cache is working
3. Check Network tab in DevTools
4. Analyze bundle size

### High API Latency
1. Check Groq API status
2. Monitor Groq rate limiting
3. Verify network connectivity
4. Check for timeouts

### High Memory Usage
1. Monitor Next.js server memory
2. Check for memory leaks in components
3. Optimize database queries
4. Limit cache size

### High Bandwidth Usage
1. Enable image optimization
2. Verify compression is enabled
3. Check for large transfers
4. Review cache TTLs

## Advanced Optimization

### Edge Caching with Vercel Edge Network
```typescript
// In middleware.ts
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/docs/')) {
    return NextResponse.next({
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }
}
```

### Database Read Replicas (Enterprise)
- Supabase Enterprise can enable read replicas
- Route read queries to replica
- Keep writes on primary

### Content Delivery Network (CDN)
- Vercel CDN is automatic
- Cache static assets globally
- Reduce TTFB globally

### Service Workers (PWA)
Not currently implemented but possible:
```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## References

- [Next.js Performance](https://nextjs.org/learn/seo/web-performance)
- [Web Vitals](https://web.dev/vitals/)
- [Supabase Performance](https://supabase.com/docs/guides/api/performance)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
