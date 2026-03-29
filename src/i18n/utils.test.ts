import { describe, it, expect } from 'vitest';
import {
  getLangFromUrl,
  useTranslations,
  getPathPrefix,
  filterPostsByLang,
  getSlugFromId,
  getAlternateUrl,
} from './utils';

describe('getLangFromUrl', () => {
  it('returns "ja" for root path', () => {
    expect(getLangFromUrl(new URL('http://example.com/'))).toBe('ja');
  });

  it('returns "ja" for Japanese blog path', () => {
    expect(getLangFromUrl(new URL('http://example.com/blog/my-post'))).toBe('ja');
  });

  it('returns "en" for English path', () => {
    expect(getLangFromUrl(new URL('http://example.com/en/blog'))).toBe('en');
  });

  it('returns "ja" for unknown language prefix', () => {
    expect(getLangFromUrl(new URL('http://example.com/fr/blog'))).toBe('ja');
  });
});

describe('useTranslations', () => {
  it('returns Japanese translation for ja', () => {
    const t = useTranslations('ja');
    expect(t('nav.home')).toBe('ホーム');
  });

  it('returns English translation for en', () => {
    const t = useTranslations('en');
    expect(t('nav.home')).toBe('Home');
  });

  it('falls back to default lang when key missing in target', () => {
    const t = useTranslations('en');
    // All keys exist in both, so test fallback to key itself
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });
});

describe('getPathPrefix', () => {
  it('returns empty string for ja (default)', () => {
    expect(getPathPrefix('ja')).toBe('');
  });

  it('returns /en for en', () => {
    expect(getPathPrefix('en')).toBe('/en');
  });
});

describe('filterPostsByLang', () => {
  const posts = [
    { id: 'ja/post-1', data: { draft: false } },
    { id: 'ja/post-2', data: { draft: true } },
    { id: 'en/post-1', data: { draft: false } },
    { id: 'en/post-3', data: { draft: true } },
  ];

  it('filters Japanese non-draft posts', () => {
    const result = filterPostsByLang(posts, 'ja');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('ja/post-1');
  });

  it('filters English non-draft posts', () => {
    const result = filterPostsByLang(posts, 'en');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('en/post-1');
  });

  it('returns empty array when no posts match', () => {
    expect(filterPostsByLang([], 'ja')).toHaveLength(0);
  });
});

describe('getSlugFromId', () => {
  it('extracts slug from ja prefixed id', () => {
    expect(getSlugFromId('ja/my-post')).toBe('my-post');
  });

  it('extracts slug from en prefixed id', () => {
    expect(getSlugFromId('en/my-post')).toBe('my-post');
  });

  it('handles nested slugs', () => {
    expect(getSlugFromId('ja/category/my-post')).toBe('category/my-post');
  });
});

describe('getAlternateUrl', () => {
  it('generates English URL from Japanese page', () => {
    const url = new URL('http://example.com/blog/my-post');
    expect(getAlternateUrl(url, 'en')).toBe('/en/blog/my-post');
  });

  it('generates Japanese URL from English page', () => {
    const url = new URL('http://example.com/en/blog/my-post');
    expect(getAlternateUrl(url, 'ja')).toBe('/blog/my-post');
  });

  it('returns same URL when target is current language (ja)', () => {
    const url = new URL('http://example.com/blog');
    expect(getAlternateUrl(url, 'ja')).toBe('/blog');
  });

  it('returns same URL when target is current language (en)', () => {
    const url = new URL('http://example.com/en/blog');
    expect(getAlternateUrl(url, 'en')).toBe('/en/blog');
  });

  it('handles root path ja to en', () => {
    const url = new URL('http://example.com/');
    expect(getAlternateUrl(url, 'en')).toBe('/en/');
  });

  it('handles root path en to ja', () => {
    const url = new URL('http://example.com/en/');
    expect(getAlternateUrl(url, 'ja')).toBe('/');
  });
});

import * as fc from 'fast-check';
import { ui } from './ui';

/**
 * Feature: astro-blog, Property 2: slug 抽出の一貫性
 *
 * Validates: Requirements 1.4
 *
 * For any valid slug string, `getSlugFromId("ja/" + slug)` and
 * `getSlugFromId("en/" + slug)` return the same value.
 */
describe('Property 2: slug 抽出の一貫性', () => {
  const slugArb = fc
    .array(
      fc.stringMatching(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/).filter((s) => s.length >= 1),
      { minLength: 1, maxLength: 3 },
    )
    .map((parts) => parts.join('/'));

  it('getSlugFromId returns the same slug regardless of language prefix', () => {
    fc.assert(
      fc.property(slugArb, (slug) => {
        expect(getSlugFromId(`ja/${slug}`)).toBe(getSlugFromId(`en/${slug}`));
      }),
    );
  });
});

/**
 * Feature: astro-blog, Property 3: draft 記事のフィルタリング
 *
 * Validates: Requirements 1.5
 *
 * For any list of posts (mix of draft true/false),
 * `filterPostsByLang` never includes posts with draft: true.
 */
describe('Property 3: draft 記事のフィルタリング', () => {
  const langArb = fc.constantFrom('ja' as const, 'en' as const);

  const postsArb = langArb.chain((lang) => {
    const postArb = fc.record({
      id: fc.stringMatching(/^[a-z0-9-]+$/).filter((s) => s.length >= 1).map((slug) => `${lang}/${slug}`),
      data: fc.record({
        draft: fc.boolean(),
      }),
    });
    return fc.tuple(fc.constant(lang), fc.array(postArb));
  });

  it('filtered results never contain draft posts', () => {
    fc.assert(
      fc.property(postsArb, ([lang, posts]) => {
        const result = filterPostsByLang(posts, lang);
        result.forEach((post) => {
          expect(post.data.draft).toBe(false);
        });
      }),
    );
  });
});

/**
 * Feature: astro-blog, Property 4: URL からの言語判定
 *
 * Validates: Requirements 2.1, 2.2
 *
 * For any URL path, if the path starts with `/en/` then `getLangFromUrl`
 * returns 'en'; otherwise it returns 'ja'.
 */
describe('Property 4: URL からの言語判定', () => {
  const pathSegmentArb = fc.stringMatching(/^[a-z0-9-]+$/).filter((s) => s.length >= 1);

  const pathArb = fc
    .array(pathSegmentArb, { minLength: 0, maxLength: 4 })
    .map((segments) => '/' + segments.join('/'));

  it('returns "en" for paths starting with /en/ and "ja" otherwise', () => {
    fc.assert(
      fc.property(pathArb, (path) => {
        const enUrl = new URL(`http://example.com/en${path}`);
        expect(getLangFromUrl(enUrl)).toBe('en');

        // Paths not starting with /en/ should return 'ja'
        const jaUrl = new URL(`http://example.com${path}`);
        if (!path.startsWith('/en/') && path !== '/en') {
          expect(getLangFromUrl(jaUrl)).toBe('ja');
        }
      }),
    );
  });
});

/**
 * Feature: astro-blog, Property 5: 翻訳キーの完全性
 *
 * Validates: Requirements 2.3
 *
 * The ja and en translation dictionaries have the exact same set of keys.
 */
describe('Property 5: 翻訳キーの完全性', () => {
  const jaKeys = Object.keys(ui.ja).sort();
  const enKeys = Object.keys(ui.en).sort();

  it('ja and en translation dictionaries have identical key sets', () => {
    expect(jaKeys).toEqual(enKeys);
  });

  it('every key in ja exists in en (property over all ja keys)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(ui.ja)), (key) => {
        expect(ui.en).toHaveProperty(key);
      }),
    );
  });

  it('every key in en exists in ja (property over all en keys)', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(ui.en)), (key) => {
        expect(ui.ja).toHaveProperty(key);
      }),
    );
  });
});

/**
 * Feature: astro-blog, Property 6: 言語切り替え URL の往復一貫性
 *
 * Validates: Requirements 2.4, 6.3
 *
 * For any valid URL, switching ja→en→ja returns the original URL
 * (round-trip property).
 */
describe('Property 6: 言語切り替え URL の往復一貫性', () => {
  const pathSegmentArb = fc.stringMatching(/^[a-z0-9-]+$/).filter((s) => s.length >= 1);

  const jaPathArb = fc
    .array(pathSegmentArb, { minLength: 0, maxLength: 4 })
    .map((segments) => '/' + segments.join('/'))
    .filter((p) => !p.startsWith('/en'));

  it('ja→en→ja round-trip returns the original URL', () => {
    fc.assert(
      fc.property(jaPathArb, (jaPath) => {
        const baseUrl = 'http://example.com';
        const jaUrl = new URL(`${baseUrl}${jaPath}`);

        // ja → en
        const enPath = getAlternateUrl(jaUrl, 'en');
        const enUrl = new URL(`${baseUrl}${enPath}`);

        // en → ja
        const roundTripped = getAlternateUrl(enUrl, 'ja');

        expect(roundTripped).toBe(jaPath);
      }),
    );
  });
});
