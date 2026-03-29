import { defaultLang, ui, type Lang } from './ui';

/** 現在の言語を取得（URL パスから判定） */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang === 'en') return 'en';
  return defaultLang;
}

/** 翻訳文字列を取得 */
export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    return ui[lang][key] || ui[defaultLang][key] || key;
  };
}

/** 言語に応じたパスプレフィックスを返す */
export function getPathPrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

/** 記事コレクションから指定言語の記事を取得するためのフィルタ */
export function filterPostsByLang(
  posts: Array<{ id: string; data: { draft: boolean } }>,
  lang: Lang,
) {
  return posts.filter(
    (post) => post.id.startsWith(`${lang}/`) && !post.data.draft,
  );
}

/** 記事 id から slug を抽出（言語プレフィックスを除去） */
export function getSlugFromId(id: string): string {
  const parts = id.split('/');
  return parts.slice(1).join('/');
}

/** 対応する他言語ページの URL を生成 */
export function getAlternateUrl(currentUrl: URL, targetLang: Lang): string {
  const currentLang = getLangFromUrl(currentUrl);
  const pathname = currentUrl.pathname;

  if (currentLang === 'en') {
    const jaPath = pathname.replace(/^\/en/, '') || '/';
    return targetLang === 'ja' ? jaPath : pathname;
  } else {
    return targetLang === 'en' ? `/en${pathname}` : pathname;
  }
}
