# 実装計画: astro-blog

## 概要

Astro v5.x + TypeScript (strict) による個人技術ブログの実装計画。Content Collections、i18n、ダークテーマ、SEO を段階的に構築する。パッケージマネージャーは bun または pnpm を使用する。

## タスク

- [x] 1. プロジェクト基盤のセットアップ
  - [x] 1.1 Astro プロジェクト初期化と基本設定
    - `pnpm create astro@latest` でプロジェクトを初期化（TypeScript strict）
    - `astro.config.mjs` に i18n 設定（defaultLocale: 'ja', locales: ['ja', 'en']）と Shiki dracula テーマを設定
    - `tsconfig.json` の strict モード確認
    - Vitest と fast-check を devDependencies に追加
    - _Requirements: 7.1, 4.3_

  - [x] 1.2 Content Collections スキーマ定義
    - `src/content.config.ts` に blog コレクションを定義（glob loader, Valibot スキーマ）
    - category を `v.picklist(['htb', 'lang', 'misc'])` で定義
    - difficulty を `v.string().optional()` で定義
    - draft を `v.boolean().default(false)` で定義
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Property テスト: Frontmatter スキーマバリデーション
    - **Property 1: Frontmatter スキーマバリデーション**
    - Valibot スキーマを直接インポートしてテスト
    - 有効な category 値の受け入れと無効な値の拒否を検証
    - **Validates: Requirements 1.1**

  - [x] 1.4 i18n ユーティリティの実装
    - `src/i18n/ui.ts` に言語定義と翻訳文字列を実装
    - `src/i18n/utils.ts` に `getLangFromUrl`, `useTranslations`, `getPathPrefix`, `filterPostsByLang`, `getSlugFromId`, `getAlternateUrl` を実装
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 1.4, 1.5_

  - [x] 1.5 Property テスト: i18n ユーティリティ
    - **Property 2: slug 抽出の一貫性** — `getSlugFromId("ja/" + slug)` === `getSlugFromId("en/" + slug)`
    - **Validates: Requirements 1.4**
    - **Property 3: draft 記事のフィルタリング** — フィルタ結果に draft: true が含まれない
    - **Validates: Requirements 1.5**
    - **Property 4: URL からの言語判定** — `/en/` 始まりは 'en'、それ以外は 'ja'
    - **Validates: Requirements 2.1, 2.2**
    - **Property 5: 翻訳キーの完全性** — ja と en の翻訳辞書が同一キーセットを持つ
    - **Validates: Requirements 2.3**
    - **Property 6: 言語切り替え URL の往復一貫性** — ja→en→ja で元の URL に戻る
    - **Validates: Requirements 2.4, 6.3**
zitu
- [x] 2. チェックポイント - 基盤の確認
  - 全テストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 3. グローバル CSS とレイアウト
  - [x] 3.1 グローバル CSS の作成
    - `src/styles/global.css` に CSS Variables（カラー、フォント、スペーシング）を定義
    - ベースカラー `#0a0e17`、アクセント `#9fef00`、セカンダリ `#a4b1cd` を設定
    - フォント: Inter（本文）、JetBrains Mono（コード）
    - リセット CSS とベーススタイルを含む
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 3.2 BaseLayout コンポーネントの作成
    - `src/layouts/BaseLayout.astro` を作成
    - Props: title, description, lang, canonicalUrl?, alternateUrl?
    - HTML head（charset, viewport, title, meta description, OGP, hreflang, canonical, フォント読み込み, global.css）
    - Header / main slot / Footer の構成
    - _Requirements: 5.1, 6.1, 6.2, 6.3, 6.4_

  - [x] 3.3 PostLayout コンポーネントの作成
    - `src/layouts/PostLayout.astro` を作成
    - BaseLayout を継承し、記事ヘッダー（タイトル、公開日、カテゴリ、difficulty、タグ）と本文スロットを配置
    - _Requirements: 5.4_

- [x] 4. UI コンポーネント
  - [x] 4.1 Header / Footer / LanguageSwitcher の作成
    - `src/components/Header.astro` — サイトタイトル、ナビゲーション（ホーム、ブログ、About）、LanguageSwitcher
    - `src/components/Footer.astro` — コピーライト表示
    - `src/components/LanguageSwitcher.astro` — 言語切り替え（getAlternateUrl を使用）
    - _Requirements: 5.2, 5.3, 2.4, 2.5_

  - [x] 4.2 PostCard / TagList コンポーネントの作成
    - `src/components/PostCard.astro` — タイトル、公開日、カテゴリバッジ、概要、タグ一覧、リンク
    - `src/components/TagList.astro` — タグリスト（各タグはタグ別一覧へのリンク）
    - _Requirements: 5.5, 5.6_

- [x] 5. 日本語ページの実装
  - [x] 5.1 トップページと記事一覧ページ
    - `src/pages/index.astro` — 最新記事一覧（filterPostsByLang + pubDate 降順ソート）
    - `src/pages/blog/index.astro` — 全記事一覧（pubDate 降順ソート）
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 5.2 Property テスト: 記事ソートとフィルタリング
    - **Property 7: 記事の pubDate 降順ソート** — 隣接ペアで pubDate が非増加
    - **Validates: Requirements 3.3, 3.4**
    - **Property 8: カテゴリフィルタリング** — フィルタ結果が全て指定カテゴリ
    - **Validates: Requirements 3.5**
    - **Property 9: タグフィルタリング** — フィルタ結果が全て指定タグを含む
    - **Validates: Requirements 3.6**

  - [x] 5.3 記事詳細ページ
    - `src/pages/blog/[...slug].astro` — Content Collections から記事取得、PostLayout で表示
    - _Requirements: 3.1, 3.7_

  - [x] 5.4 カテゴリ別・タグ別一覧ページ
    - `src/pages/category/[category].astro` — カテゴリフィルタ + 記事一覧
    - `src/pages/tags/[tag].astro` — タグフィルタ + 記事一覧
    - _Requirements: 3.1, 3.5, 3.6_

- [x] 6. チェックポイント - 日本語ページの確認
  - 全テストが通ることを確認し、不明点があればユーザーに質問する。

- [x] 7. 英語ページとサンプル記事
  - [ ] 7.1 英語版ページ群の作成
    - `src/pages/en/index.astro`, `src/pages/en/blog/index.astro`, `src/pages/en/blog/[...slug].astro`, `src/pages/en/category/[category].astro`, `src/pages/en/tags/[tag].astro`, `src/pages/en/about.astro`
    - 日本語ページと同じロジックで lang='en' を渡す
    - _Requirements: 3.2_

  - [ ] 7.2 サンプル記事の作成
    - 日本語・英語 各カテゴリ（htb, lang, misc）1本ずつ、計6記事
    - `src/content/blog/ja/` と `src/content/blog/en/` に配置
    - 同一 slug で言語対応付け
    - _Requirements: 1.3, 1.4_

- [x] 8. About ページと SEO 仕上げ
  - [ ] 8.1 About ページの作成
    - `src/pages/about.astro`（日本語）
    - `src/pages/en/about.astro`（英語）
    - BaseLayout を使用
    - _Requirements: 3.1, 3.2_

  - [ ] 8.2 SEO メタタグの最終確認
    - 全ページで title, meta description, OGP, hreflang, canonical が正しく設定されていることを確認
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 8.3 デプロイ設定
    - `astro.config.mjs` に output: 'static' を設定
    - Netlify / GitHub Pages 用のアダプター設定またはビルドコマンド設定
    - _Requirements: 7.2, 7.3_

- [x] 9. 最終チェックポイント
  - 全テストが通ることを確認し、不明点があればユーザーに質問する。

## 備考

- `*` マーク付きのタスクはオプションであり、MVP では省略可能
- 各タスクは具体的な要件を参照しており、トレーサビリティを確保
- チェックポイントで段階的に品質を検証
- プロパティテストは正当性の普遍的な検証、ユニットテストは具体例とエッジケースの検証を担う
