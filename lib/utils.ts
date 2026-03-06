/**
 * Utility Functions
 * Common helpers for documentation rendering and search
 */

import { DocPage } from '@/types/content';

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Extract first paragraph from content
 */
export function extractExcerpt(content: string, length: number = 160): string {
  const paragraphs = content.split('\n\n');
  const text = paragraphs[0]
    .replace(/[#*\-\[\]()]/g, '')
    .trim();
  
  if (text.length > length) {
    return text.substring(0, length).trim() + '...';
  }
  return text;
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Highlight search term in text
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Get related pages by category
 */
export function getRelatedPagesByCategory(
  currentPage: DocPage,
  allPages: DocPage[],
  limit: number = 3
): DocPage[] {
  return allPages
    .filter(
      (page) =>
        page.category === currentPage.category &&
        page.id !== currentPage.id
    )
    .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
    .slice(0, limit);
}

/**
 * Get related pages by tags
 */
export function getRelatedPagesByTags(
  currentPage: DocPage,
  allPages: DocPage[]
): DocPage[] {
  return allPages
    .filter((page) =>
      page.relatedPages.includes(currentPage.id) ||
      currentPage.relatedPages.includes(page.id)
    )
    .slice(0, 5);
}

/**
 * Calculate page similarity score
 */
export function calculateSimilarity(page1: DocPage, page2: DocPage): number {
  let score = 0;

  // Same category: +2 points
  if (page1.category === page2.category) score += 2;

  // Related pages: +1 point each
  if (page1.relatedPages.includes(page2.id)) score += 1;
  if (page2.relatedPages.includes(page1.id)) score += 1;

  // Title similarity
  const titleWords1 = new Set(page1.title.toLowerCase().split(/\s+/));
  const titleWords2 = new Set(page2.title.toLowerCase().split(/\s+/));
  const commonWords = [...titleWords1].filter((word) =>
    titleWords2.has(word)
  ).length;
  score += commonWords;

  return score;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Check if text contains code blocks
 */
export function hasCodeBlocks(content: string): boolean {
  return /```/.test(content) || /`[^`]+`/.test(content);
}

/**
 * Count code blocks
 */
export function countCodeBlocks(content: string): number {
  const matches = content.match(/```[\s\S]*?```/g);
  return matches ? matches.length : 0;
}

/**
 * Get all headings from content
 */
export function extractHeadings(content: string): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];
  const lines = content.split('\n');

  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
      });
    }
  });

  return headings;
}

/**
 * Generate table of contents from headings
 */
export function generateTableOfContents(
  content: string
): Array<{ level: number; text: string; slug: string }> {
  return extractHeadings(content).map((heading) => ({
    ...heading,
    slug: generateSlug(heading.text),
  }));
}

/**
 * Sort pages by relevance
 */
export function sortByRelevance(
  pages: DocPage[],
  query: string
): DocPage[] {
  const queryLower = query.toLowerCase();

  return pages.sort((a, b) => {
    const aTitle = a.title.toLowerCase();
    const bTitle = b.title.toLowerCase();
    const aDesc = a.description.toLowerCase();
    const bDesc = b.description.toLowerCase();

    // Exact title match
    if (aTitle === queryLower && bTitle !== queryLower) return -1;
    if (bTitle === queryLower && aTitle !== queryLower) return 1;

    // Title contains query
    const aContainsTitle = aTitle.includes(queryLower);
    const bContainsTitle = bTitle.includes(queryLower);
    if (aContainsTitle && !bContainsTitle) return -1;
    if (bContainsTitle && !aContainsTitle) return 1;

    // Description contains query
    const aContainsDesc = aDesc.includes(queryLower);
    const bContainsDesc = bDesc.includes(queryLower);
    if (aContainsDesc && !bContainsDesc) return -1;
    if (bContainsDesc && !aContainsDesc) return 1;

    // Sort by update date (newer first)
    return b.lastUpdated.getTime() - a.lastUpdated.getTime();
  });
}

/**
 * Batch process with concurrency control
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item)
      .then((result) => results.push(result))
      .then(() => {
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();

  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
