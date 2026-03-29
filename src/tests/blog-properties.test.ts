import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: astro-blog
 * Property-based tests for blog post sorting and filtering
 */

// Mock post type for testing
interface MockPost {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    category: 'htb' | 'lang' | 'misc';
    tags: string[];
    draft: boolean;
  };
}

// Helper function to sort posts by pubDate descending
function sortPostsByPubDate(posts: MockPost[]): MockPost[] {
  return [...posts].sort((a, b) => 
    b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );
}

// Helper function to filter posts by category
function filterPostsByCategory(posts: MockPost[], category: string): MockPost[] {
  return posts.filter(post => post.data.category === category);
}

// Helper function to filter posts by tag
function filterPostsByTag(posts: MockPost[], tag: string): MockPost[] {
  return posts.filter(post => post.data.tags.includes(tag));
}

// Arbitrary for generating mock posts
const mockPostArbitrary = fc.record({
  id: fc.string(),
  data: fc.record({
    title: fc.string(),
    description: fc.string(),
    pubDate: fc.integer({ min: 946684800000, max: 1924905600000 }).map(ts => new Date(ts)),
    category: fc.constantFrom('htb' as const, 'lang' as const, 'misc' as const),
    tags: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
    draft: fc.boolean(),
  }),
});

describe('Blog Post Sorting and Filtering Properties', () => {
  /**
   * Property 7: 記事の pubDate 降順ソート
   * **Validates: Requirements 3.3, 3.4**
   */
  it('Property 7: sorted posts have non-increasing pubDate (descending order)', () => {
    fc.assert(
      fc.property(
        fc.array(mockPostArbitrary, { minLength: 0, maxLength: 20 }),
        (posts) => {
          const sorted = sortPostsByPubDate(posts);
          
          // Check all adjacent pairs have non-increasing pubDate
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i].data.pubDate.getTime();
            const next = sorted[i + 1].data.pubDate.getTime();
            expect(current).toBeGreaterThanOrEqual(next);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: カテゴリフィルタリング
   * **Validates: Requirements 3.5**
   */
  it('Property 8: filtered posts all belong to specified category', () => {
    fc.assert(
      fc.property(
        fc.array(mockPostArbitrary, { minLength: 0, maxLength: 20 }),
        fc.constantFrom('htb' as const, 'lang' as const, 'misc' as const),
        (posts, category) => {
          const filtered = filterPostsByCategory(posts, category);
          
          // All filtered posts must have the specified category
          filtered.forEach(post => {
            expect(post.data.category).toBe(category);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: タグフィルタリング
   * **Validates: Requirements 3.6**
   */
  it('Property 9: filtered posts all contain specified tag', () => {
    fc.assert(
      fc.property(
        fc.array(mockPostArbitrary, { minLength: 1, maxLength: 20 }),
        (posts) => {
          // Get all unique tags from posts
          const allTags = new Set<string>();
          posts.forEach(post => {
            post.data.tags.forEach(tag => allTags.add(tag));
          });
          
          // Skip if no tags exist
          if (allTags.size === 0) return;
          
          // Pick a random tag to filter by
          const tagsArray = Array.from(allTags);
          const tag = tagsArray[Math.floor(Math.random() * tagsArray.length)];
          
          const filtered = filterPostsByTag(posts, tag);
          
          // All filtered posts must contain the specified tag
          filtered.forEach(post => {
            expect(post.data.tags).toContain(tag);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
