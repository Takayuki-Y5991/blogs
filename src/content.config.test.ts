import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { z } from 'zod';

// Test-friendly version of the blog schema (not importing from astro:content)
const blogSchemaTest = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  category: z.enum(['htb', 'lang', 'misc']),
  tags: z.array(z.string()),
  difficulty: z.string().optional(),
  draft: z.boolean().default(false),
});

/**
 * Feature: astro-blog, Property 1: Frontmatter スキーマバリデーション
 *
 * Validates: Requirements 1.1
 *
 * For any Frontmatter data where category is one of "htb" | "lang" | "misc",
 * title is a non-empty string, pubDate is a valid date, and tags is a string array,
 * schema validation succeeds. When category is not one of these 3 values,
 * validation fails.
 */
describe('Property 1: Frontmatter スキーマバリデーション', () => {
  const validCategories = ['htb', 'lang', 'misc'] as const;

  const validFrontmatterArb = fc.record({
    title: fc.string({ minLength: 1 }),
    description: fc.string(),
    pubDate: fc.date({ noInvalidDate: true }),
    category: fc.constantFrom(...validCategories),
    tags: fc.array(fc.string()),
    difficulty: fc.option(fc.string(), { nil: undefined }),
    draft: fc.option(fc.boolean(), { nil: undefined }),
  });

  it('accepts valid frontmatter with valid category values', () => {
    fc.assert(
      fc.property(validFrontmatterArb, (frontmatter) => {
        const result = blogSchemaTest.safeParse(frontmatter);
        expect(result.success).toBe(true);
      }),
    );
  });

  const invalidCategoryArb = fc
    .string({ minLength: 1 })
    .filter((s) => !validCategories.includes(s as any));

  const invalidCategoryFrontmatterArb = fc.record({
    title: fc.string({ minLength: 1 }),
    description: fc.string(),
    pubDate: fc.date({ noInvalidDate: true }),
    category: invalidCategoryArb,
    tags: fc.array(fc.string()),
    difficulty: fc.option(fc.string(), { nil: undefined }),
    draft: fc.option(fc.boolean(), { nil: undefined }),
  });

  it('rejects frontmatter with invalid category values', () => {
    fc.assert(
      fc.property(invalidCategoryFrontmatterArb, (frontmatter) => {
        const result = blogSchemaTest.safeParse(frontmatter);
        expect(result.success).toBe(false);
      }),
    );
  });
});
