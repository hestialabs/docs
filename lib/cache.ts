/**
 * Redis Caching Layer
 * High-performance caching for documentation searches and AI responses
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const CACHE_DURATIONS = {
  SEARCH_RESULTS: 3600, // 1 hour
  AI_RESPONSE: 86400, // 24 hours
  DOCUMENTATION: 604800, // 7 days
  SHORT_LIVED: 300, // 5 minutes
} as const;

/**
 * Generate cache key
 */
function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(':');
}

/**
 * Cache search results
 */
export async function cacheSearchResults(
  query: string,
  results: unknown,
  duration: number = CACHE_DURATIONS.SEARCH_RESULTS
) {
  try {
    const key = getCacheKey('search', query);
    await redis.setex(key, duration, JSON.stringify(results));
    return true;
  } catch (error) {
    console.error('Cache write error:', error);
    return false;
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(query: string) {
  try {
    const key = getCacheKey('search', query);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Cache AI response
 */
export async function cacheAIResponse(
  conversationId: string,
  query: string,
  response: unknown,
  duration: number = CACHE_DURATIONS.AI_RESPONSE
) {
  try {
    const key = getCacheKey('ai_response', conversationId, query);
    await redis.setex(key, duration, JSON.stringify(response));
    return true;
  } catch (error) {
    console.error('Cache write error:', error);
    return false;
  }
}

/**
 * Get cached AI response
 */
export async function getCachedAIResponse(conversationId: string, query: string) {
  try {
    const key = getCacheKey('ai_response', conversationId, query);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Cache documentation page
 */
export async function cacheDocumentation(
  pageId: string,
  content: unknown,
  duration: number = CACHE_DURATIONS.DOCUMENTATION
) {
  try {
    const key = getCacheKey('doc', pageId);
    await redis.setex(key, duration, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error('Cache write error:', error);
    return false;
  }
}

/**
 * Get cached documentation
 */
export async function getCachedDocumentation(pageId: string) {
  try {
    const key = getCacheKey('doc', pageId);
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Invalidate documentation cache
 */
export async function invalidateDocumentationCache(pageId: string) {
  try {
    const key = getCacheKey('doc', pageId);
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return false;
  }
}

/**
 * Get cache stats
 */
export async function getCacheStats() {
  try {
    const stats = await redis.info();
    return stats;
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return null;
  }
}

/**
 * Clear all caches (use with caution)
 */
export async function clearAllCaches() {
  try {
    await redis.flushdb();
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
}
