# 要件定義書

## はじめに

Astro (v5.x) + TypeScript (strict) で構築する個人技術ブログの要件定義。HackTheBox の攻略記録と Clojure 等の言語探求を中心に発信するサイトで、日本語・英語の多言語対応、ダーク系サイバーテーマを特徴とする。

## 用語集

- **Blog**: Astro フレームワークで構築される個人技術ブログサイト全体
- **Content_Collections**: Astro の Content Collections 機能を用いた記事管理システム
- **Post**: Markdown 形式で記述される個別のブログ記事
- **Frontmatter**: 記事ファイル先頭の YAML メタデータ（title, description, pubDate, category, tags, difficulty, draft）
- **Category**: 記事の分類（htb: HackTheBox Writeups, lang: 言語探求, misc: その他）
- **Tag**: 記事に付与される自由形式のラベル
- **Language_Switcher**: ヘッダーに配置される日本語・英語切り替え UI コンポーネント
- **BaseLayout**: 全ページ共通のレイアウトコンポーネント（head, header, footer を含む）
- **PostLayout**: 記事詳細ページ専用のレイアウトコンポーネント
- **PostCard**: 記事一覧で使用される記事プレビューカードコンポーネント
- **Slug**: 記事の URL パス識別子。同一 slug で日本語・英語記事を対応付ける
- **i18n_Utility**: 翻訳文字列とヘルパー関数を提供する多言語対応ユーティリティ

## 要件

### 要件 1: Content Collections による記事管理

**ユーザーストーリー:** ブログ運営者として、Markdown 形式で記事を管理したい。型安全な Frontmatter スキーマにより記事データの整合性を保証するため。

#### 受け入れ基準

1. THE Content_Collections SHALL Frontmatter スキーマとして title（文字列）、description（文字列）、pubDate（日付）、category（"htb" | "lang" | "misc" の列挙型）、tags（文字列配列）、difficulty（任意の文字列）、draft（真偽値）を定義する
2. WHEN category が "htb" 以外の Post が difficulty フィールドを持つ場合、THE Content_Collections SHALL そのフィールドを無視して正常に処理する
3. THE Content_Collections SHALL 記事ファイルを `src/content/blog/ja/` と `src/content/blog/en/` の言語別ディレクトリで管理する
4. WHEN 同一 Slug の記事が日本語・英語の両ディレクトリに存在する場合、THE Blog SHALL それらを同一記事の言語バリエーションとして対応付ける
5. WHEN draft が true に設定された Post が存在する場合、THE Blog SHALL 本番ビルド時にその Post を公開ページから除外する

### 要件 2: 多言語 (i18n) 対応

**ユーザーストーリー:** 読者として、日本語と英語でブログコンテンツを閲覧したい。自分の言語でコンテンツにアクセスできるようにするため。

#### 受け入れ基準

1. THE Blog SHALL 日本語をデフォルト言語とし、プレフィックスなしの URL（例: `/blog/`）で日本語ページを提供する
2. THE Blog SHALL 英語ページを `/en/` プレフィックス付きの URL（例: `/en/blog/`）で提供する
3. THE i18n_Utility SHALL UI ラベル（ナビゲーション、カテゴリ名、日付表示等）の翻訳文字列を日本語・英語の両方で提供する
4. WHEN ユーザーが Language_Switcher を操作した場合、THE Blog SHALL 現在のページに対応する他言語のページへ遷移する
5. WHEN 対応する他言語の記事が存在しない場合、THE Language_Switcher SHALL その言語のトップページへ遷移する

### 要件 3: ページルーティングとサイト構成

**ユーザーストーリー:** 読者として、トップページ、記事一覧、記事詳細、カテゴリ別一覧、タグ別一覧、About ページにアクセスしたい。目的のコンテンツに効率的にたどり着くため。

#### 受け入れ基準

1. THE Blog SHALL 日本語ページとして `/`（トップ）、`/blog/`（全記事一覧）、`/blog/[slug]`（記事詳細）、`/category/[category]`（カテゴリ別一覧）、`/tags/[tag]`（タグ別一覧）、`/about`（自己紹介）を提供する
2. THE Blog SHALL 英語ページとして `/en/`、`/en/blog/`、`/en/blog/[slug]`、`/en/category/[category]`、`/en/tags/[tag]`、`/en/about` を提供する
3. WHEN トップページにアクセスした場合、THE Blog SHALL 最新の公開記事を一覧表示する
4. WHEN 記事一覧ページにアクセスした場合、THE Blog SHALL 全公開記事を pubDate の降順で一覧表示する
5. WHEN カテゴリ別一覧ページにアクセスした場合、THE Blog SHALL 指定カテゴリに属する公開記事のみを一覧表示する
6. WHEN タグ別一覧ページにアクセスした場合、THE Blog SHALL 指定タグを持つ公開記事のみを一覧表示する
7. WHEN 記事詳細ページにアクセスした場合、THE Blog SHALL 記事本文、タイトル、公開日、カテゴリ、タグを表示する

### 要件 4: ダークテーマ UI デザイン

**ユーザーストーリー:** 読者として、HackTheBox 風のサイバーテーマで統一されたダークデザインのブログを閲覧したい。技術ブログとしての雰囲気を楽しむため。

#### 受け入れ基準

1. THE Blog SHALL ベースカラー `#0a0e17`、アクセントカラー `#9fef00`、セカンダリカラー `#a4b1cd` を CSS Variables で定義する
2. THE Blog SHALL 本文フォントに Inter、コードフォントに JetBrains Mono を使用する
3. THE Blog SHALL コードブロックに Shiki シンタックスハイライターの dracula テーマを適用する
4. THE Blog SHALL CSS Variables を用いた Vanilla CSS でスタイリングを行う

### 要件 5: 共通レイアウトとコンポーネント

**ユーザーストーリー:** 読者として、全ページで一貫したナビゲーションとレイアウトを利用したい。サイト内を迷わず移動できるようにするため。

#### 受け入れ基準

1. THE BaseLayout SHALL 全ページ共通の HTML head（メタタグ、フォント読み込み、CSS）、Header、Footer を含む
2. THE Header SHALL サイトタイトル、ナビゲーションリンク（トップ、ブログ、About）、Language_Switcher を含む
3. THE Footer SHALL コピーライト表示を含む
4. THE PostLayout SHALL BaseLayout を継承し、記事タイトル、公開日、カテゴリ、タグ、記事本文を表示する
5. THE PostCard SHALL 記事タイトル、公開日、カテゴリ、概要（description）、タグ一覧を表示する
6. WHEN PostCard がクリックされた場合、THE Blog SHALL 対応する記事詳細ページへ遷移する

### 要件 6: SEO とメタデータ

**ユーザーストーリー:** ブログ運営者として、検索エンジンとソーシャルメディアでの記事の発見性を高めたい。より多くの読者にコンテンツを届けるため。

#### 受け入れ基準

1. THE Blog SHALL 各ページに適切な title タグと meta description を設定する
2. THE Blog SHALL 各ページに OGP（Open Graph Protocol）メタタグ（og:title, og:description, og:type, og:url）を設定する
3. THE Blog SHALL 日本語・英語の対応ページ間に hreflang タグを設定する
4. THE Blog SHALL 各ページに canonical URL を設定する

### 要件 7: プロジェクト基盤とデプロイ設定

**ユーザーストーリー:** ブログ運営者として、モダンなツールチェーンで構築し静的サイトとしてデプロイしたい。高速な開発体験と安定したホスティングを実現するため。

#### 受け入れ基準

1. THE Blog SHALL パッケージマネージャーとして bun または pnpm を使用する
2. THE Blog SHALL Astro の静的サイト生成（SSG）モードでビルドする
3. THE Blog SHALL Netlify または GitHub Pages へのデプロイに対応する設定を含む
