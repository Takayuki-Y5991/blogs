# ブログ構築計画

## 概要

Astro フレームワーク + TypeScript で構築する個人技術ブログ。
HackTheBox の攻略記録と Clojure 等の言語探求を中心に発信する。

## 決定事項

| 項目 | 決定内容 |
|------|----------|
| フレームワーク | Astro (v5.x) |
| 言語 | TypeScript (strict) |
| デザインテーマ | ダーク系（HackTheBox風サイバー） |
| 記事フォーマット | Markdown (Astro Content Collections) |
| スタイリング | Vanilla CSS (CSS Variables) |
| 多言語対応 | 日本語（デフォルト）+ 英語切り替え |
| デプロイ先 | Netlify or GitHub Pages |

## カテゴリ構成

| カテゴリ | slug | 説明 |
|----------|------|------|
| HackTheBox Writeups | `htb` | マシン攻略記録 |
| 言語探求 | `lang` | Clojure 等のプログラミング言語学習記録 |
| その他 | `misc` | 上記以外の技術記事・雑記 |

## 多言語 (i18n) 方針

- デフォルト言語: 日本語 (`ja`)
- 対応言語: 日本語 / 英語 (`en`)
- Astro の i18n ルーティング機能を使用
- URL 構造:
  - 日本語（デフォルト）: `/blog/`, `/about/` など（プレフィックスなし）
  - 英語: `/en/blog/`, `/en/about/`
- 記事は言語ごとに別ファイルで管理（同一 slug で対応付け）
- Header にランゲージスイッチャーを配置

## サイト構成

```
日本語（デフォルト）:
/                    → トップページ（最新記事一覧）
/blog/               → 全記事一覧
/blog/[slug]         → 記事詳細
/category/[category] → カテゴリ別一覧
/about               → 自己紹介
/tags/[tag]          → タグ別一覧

英語:
/en/                 → トップページ
/en/blog/            → 全記事一覧
/en/blog/[slug]      → 記事詳細
/en/category/[category] → カテゴリ別一覧
/en/about            → 自己紹介
/en/tags/[tag]       → タグ別一覧
```

## プロジェクト構造

```
/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── i18n/
│   │   └── ui.ts             # 翻訳文字列（UI ラベル等）
│   ├── content/
│   │   ├── config.ts          # Content Collections 定義
│   │   └── blog/
│   │       ├── en/            # 英語記事
│   │       │   ├── htb-example.md
│   │       │   └── clojure-intro.md
│   │       └── ja/            # 日本語記事
│   │           ├── htb-example.md
│   │           └── clojure-intro.md
│   ├── layouts/
│   │   ├── BaseLayout.astro   # 共通レイアウト（head, nav, footer）
│   │   └── PostLayout.astro   # 記事用レイアウト
│   ├── pages/
│   │   ├── index.astro        # トップページ（日本語）
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── category/
│   │   │   └── [category].astro
│   │   ├── tags/
│   │   │   └── [tag].astro
│   │   ├── about.astro
│   │   └── en/                # 英語ページ
│   │       ├── index.astro
│   │       ├── blog/
│   │       │   ├── index.astro
│   │       │   └── [...slug].astro
│   │       ├── category/
│   │       │   └── [category].astro
│   │       ├── tags/
│   │       │   └── [tag].astro
│   │       └── about.astro
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── TagList.astro
│   │   └── LanguageSwitcher.astro  # 言語切り替え
│   └── styles/
│       └── global.css
└── docs/
    └── plan.md
```

## デザイン方針

- ベースカラー: `#0a0e17`（深い紺黒）
- アクセントカラー: `#9fef00`（HackTheBox グリーン）
- セカンダリ: `#a4b1cd`（淡いグレーブルー）
- フォント: `JetBrains Mono`（コード）/ `Inter`（本文）
- コードブロック: シンタックスハイライト付き（Shiki, dracula テーマ）
- ターミナル風の装飾要素を随所に配置

## 記事 Frontmatter スキーマ

```yaml
---
title: "マシン名 - HackTheBox Writeup"
description: "概要"
pubDate: 2026-02-19
category: "htb"          # htb | lang | misc
tags: ["linux", "privesc", "web"]
difficulty: "Medium"     # htb 専用（任意）
draft: false
---
```

## 実装フェーズ

### Phase 1: プロジェクト基盤
1. Astro プロジェクト初期化 + TypeScript 設定 + i18n 設定
2. Content Collections スキーマ定義（言語別ディレクトリ対応）
3. i18n ユーティリティ（翻訳文字列・ヘルパー関数）
4. BaseLayout + グローバルCSS（ダークテーマ）

### Phase 2: コアページ
5. Header / Footer / LanguageSwitcher コンポーネント
6. トップページ（最新記事一覧）
7. 記事一覧ページ (`/blog/`)
8. 記事詳細ページ (`/blog/[slug]`)

### Phase 3: カテゴリ・タグ
9. カテゴリ別一覧ページ
10. タグ別一覧ページ
11. PostCard コンポーネント

### Phase 4: 英語ページ
12. 英語版ページ群（/en/ 配下）
13. サンプル記事作成（日本語・英語 各カテゴリ1本ずつ）

### Phase 5: 仕上げ
14. About ページ（日本語・英語）
15. SEO メタタグ・OGP 設定（hreflang 含む）
16. デプロイ設定（Netlify / GitHub Pages）

## 未決定事項

- [ ] ブログタイトル / サイト名
- [ ] RSS フィード対応の要否
- [ ] 検索機能の要否
- [ ] コメント機能の要否（giscus 等）