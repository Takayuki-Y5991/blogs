# デプロイガイド / Deployment Guide

このブログは静的サイトとして生成され、GitHub Pages にデプロイされます。

This blog is generated as a static site and deployed to GitHub Pages.

## GitHub Pages へのデプロイ / Deploy to GitHub Pages

### 前提条件 / Prerequisites

1. GitHub リポジトリの Settings > Pages で以下を設定:
   - Source: GitHub Actions
   - Branch: main

### デプロイ方法 / Deployment Method

`.github/workflows/deploy.yml` が設定済みです。`main` ブランチへの push で自動デプロイされます。

The `.github/workflows/deploy.yml` workflow is already configured. Pushing to the `main` branch will trigger automatic deployment.

## ビルドコマンド / Build Commands

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

## 環境変数 / Environment Variables

必要に応じて以下の環境変数を設定してください:

Set the following environment variables as needed:

- `SITE_URL`: サイトの URL（デフォルト: https://konkon.dev）
- `SITE_URL`: Site URL (default: https://konkon.dev)

## SEO 設定 / SEO Configuration

全ページに以下の SEO メタタグが自動設定されます:

All pages automatically include the following SEO meta tags:

- Title tag
- Meta description
- Canonical URL
- Hreflang tags (ja, en, x-default)
- Open Graph Protocol (OGP) tags
- Twitter Card tags

## 技術スタック / Tech Stack

- Astro v5.x
- TypeScript (strict mode)
- Static Site Generation (SSG)
- pnpm package manager
