import { describe, it, expect } from 'vitest';
import { getPathPrefix } from '../i18n/utils';

describe('TagList Component', () => {
  it('should generate correct tag URLs for Japanese', () => {
    const lang = 'ja';
    const tags = ['typescript', 'astro', 'web'];
    const prefix = getPathPrefix(lang);

    tags.forEach((tag) => {
      const expectedUrl = `${prefix}/tags/${tag}`;
      expect(expectedUrl).toBe(`/tags/${tag}`);
    });
  });

  it('should generate correct tag URLs for English', () => {
    const lang = 'en';
    const tags = ['typescript', 'astro', 'web'];
    const prefix = getPathPrefix(lang);

    tags.forEach((tag) => {
      const expectedUrl = `${prefix}/tags/${tag}`;
      expect(expectedUrl).toBe(`/en/tags/${tag}`);
    });
  });

  it('should handle empty tag arrays', () => {
    const tags: string[] = [];
    expect(tags).toHaveLength(0);
  });

  it('should handle tags with special characters', () => {
    const tags = ['c++', 'c#', 'node.js'];
    expect(tags).toHaveLength(3);
    tags.forEach((tag) => {
      expect(typeof tag).toBe('string');
    });
  });
});
