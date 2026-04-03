---
title: "Message For You"
description: "Daily AlpacaHack: 2026/04/02"
pubDate: 2026-04-03
category: "daily-alpacahack"
tags: ["ctf", "security", "web"]
difficulty: "Easy"
draft: false
---

# Session for You

2026/04/02の課題である `Message For You` に関するWriteUp

## 概要

Flask のクライアントサイドセッション（署名付きクッキー）にフラグが格納されており、
それをデコードして読み取る問題。

## コード解説

サーバー側のコードは以下の通りです。

```python
from flask import Flask, session
import os
import secrets

FLAG = os.environ.get("FLAG", "Alpaca{**REDACTED**}")

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

MESSAGE = f"""
Roses are red,
Violets are blue,
I've hidden a flag
In a session for you: {FLAG}
""".strip()

HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message for You!</title>
</head>
<body>
    <p>I've got a message for you.</p>
    <p>It's hidden somewhere around here...</p>
</body>
</html>
""".strip()

@app.get("/")
def index():
    session["message"] = MESSAGE
    return HTML

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
```

`/` にアクセスすると、フラグを含む `MESSAGE` がセッションに格納されてクッキーとして返されます。
HTMLにはフラグの手がかりは一切なく、セッションクッキーの中身を読む必要があります。

`app.secret_key` は `secrets.token_hex(32)` でランダム生成されているため、署名の偽造はできません。
しかし、Flask のセッションクッキーは署名されているだけで暗号化はされていないため、ペイロード部分は誰でも読み取れます。

## 攻略手順

<details class="spoiler">
<summary>🔍 攻略手順を表示する（ネタバレ注意）</summary>

### 1. Flask セッションクッキーの構造を理解する

Flask のセッションクッキーは `itsdangerous` ライブラリによって生成され、以下の構造になっています。

```
<payload>.<timestamp>.<signature>
```

- `payload`: JSON を zlib 圧縮して base64url エンコードしたもの
- `timestamp`: 発行時刻
- `signature`: HMAC による署名（`secret_key` が必要）

ペイロードが一定サイズを超えると zlib 圧縮が適用され、その場合クッキー値の先頭に `.` が付きます。

```
.eJyrVsp...  →  先頭が . → zlib 圧縮あり
eJyrVsp...   →  先頭なし → 圧縮なし
```

### 2. curl でセッションクッキーを取得する

```bash
curl -v http://localhost:3000/
```

レスポンスヘッダーの `Set-Cookie` からセッション値を取得します。

```
Set-Cookie: session=.eJyrVspNLS5OTE9VslIK...; HttpOnly; Path=/
```

### 3. ペイロードをデコードする

`.` 区切りの2番目のパート（ペイロード部分）を取り出し、base64url → base64 変換後に zlib 展開します。

</details>

<details class="spoiler">
<summary>💻 エクスプロイトを表示する（ネタバレ注意）</summary>

### 4. エクスプロイト

```bash
SESSION=".eJyrVspNLS5OTE9VslIKyi9OLVZILEpVKEpN0YnJC8vMz0ktgYgk5ZSmAoU81ctSFTIyU1JS8xQSFdJyEtOBYiAmUGdxZn6eQlp-kUJlfqmVgmNOQWJyYnWQq4ujc4irS61SLQDsByU9.ac-apg.aWrQpqnfTtEWEUkyt-UXfmC9R1c"
PAYLOAD=$(echo $SESSION | cut -d'.' -f2)
echo $PAYLOAD | tr '_-' '/+' | base64 -d 2>/dev/null | python3 -c "import sys,zlib; print(zlib.decompress(sys.stdin.buffer.read()).decode())"
```

動作の流れ：

1. `cut -d'.' -f2` でペイロード部分を取り出す
2. `tr '_-' '/+'` で base64url → base64 に変換（`-` → `+`、`_` → `/`）
3. `base64 -d` でバイナリにデコード
4. `zlib.decompress()` で圧縮を展開し JSON バイト列を得る
5. `.decode()` で文字列に変換して表示

出力結果：

```json
{"message":"Roses are red,\nViolets are blue,\nI've hidden a flag\nIn a session for you: Alpaca{...}"}
```

</details>

## 必要となる前提知識

#### Flask セッションクッキーの仕組み

Flask はデフォルトでセッションデータをサーバー側ではなくクライアント側（クッキー）に保存します。
データは署名されていますが暗号化はされていないため、`secret_key` がなくてもペイロードの読み取りは可能です。

#### zlib 圧縮の判別

`itsdangerous` はペイロードが一定サイズを超えると自動的に zlib 圧縮を適用し、クッキー値の先頭に `.` を付けます。
先頭の `.` の有無で圧縮されているかどうかを判断できます。

#### base64url と base64 の違い

通常の base64 では `+` と `/` を使いますが、URL に安全に埋め込むために base64url では `-` と `_` に置き換えられています。
デコード前に `tr '_-' '/+'` で変換が必要です。

#### Python での zlib 展開

```python
import sys, zlib
# パイプからバイナリを受け取り、zlib展開して文字列に変換
print(zlib.decompress(sys.stdin.buffer.read()).decode())
```

- `sys.stdin.buffer.read()`: パイプで渡されたデータをバイナリとして読み込む
- `zlib.decompress()`: zlib 圧縮を展開してバイト列を得る
- `.decode()`: バイト列を UTF-8 文字列に変換

## まとめ

Flask のセッションクッキーは署名されているだけで暗号化されていないため、ペイロードは誰でも読み取れます。
フラグのような機密情報をクライアントサイドセッションに格納してはいけないという、シンプルかつ重要な教訓が詰まった問題でした。
