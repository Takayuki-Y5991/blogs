export const languages = {
  ja: '日本語',
  en: 'English',
} as const;

export const defaultLang = 'ja' as const;

export type Lang = keyof typeof languages;

export const ui: Record<Lang, Record<string, string>> = {
  ja: {
    'nav.home': 'ホーム',
    'nav.blog': 'ブログ',
    'nav.about': 'About',
    'category.htb': 'HackTheBox Writeups',
    'category.lang': '言語探求',
    'category.misc': 'その他',
    'category.daily-alpacahack': 'Daily AlpacaHack',
    'post.publishedAt': '公開日',
    'post.category': 'カテゴリ',
    'post.tags': 'タグ',
    'post.allPosts': '全記事一覧',
    'post.latestPosts': '最新記事',
  },
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'category.htb': 'HackTheBox Writeups',
    'category.lang': 'Language Exploration',
    'category.misc': 'Misc',
    'category.daily-alpacahack': 'Daily AlpacaHack',
    'post.publishedAt': 'Published',
    'post.category': 'Category',
    'post.tags': 'Tags',
    'post.allPosts': 'All Posts',
    'post.latestPosts': 'Latest Posts',
  },
};
