# デプロイガイド / Deployment Guide

このブログは静的サイトとして生成され、Netlify にデプロイされます。

This blog is generated as a static site and deployed to Netlify.

## Netlify へのデプロイ / Deploy to Netlify

### Git 連携（推奨）

1. https://app.netlify.com で GitHub リポジトリを接続
2. ビルド設定は `netlify.toml` に記載済み
3. `main` ブランチへの push で自動デプロイされます

### Netlify CLI

```bash
npm install -g netlify-cli
pnpm build
netlify deploy --prod --dir=dist
```

## ビルドコマンド / Build Commands

```bash
# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview
```

## 技術スタック / Tech Stack

- Astro v5.x
- TypeScript (strict mode)
- Static Site Generation (SSG)
- pnpm package manager
