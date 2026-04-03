---
title: "Silence"
description: "Daily AlpacaHack: 2026/03/31"
pubDate: 2026-04-01
category: "daily-alpacahack"
tags: ["ctf", "security", "pwn", "python"]
difficulty: "Easy"
draft: false
---

# Silence

2026/03/31の課題である `silence` に関するWriteUp

## 概要

`subprocess.run` で標準出力が `/dev/null` にリダイレクトされている環境下で、いかにしてフラグを出力させるかを問う問題。

## コード解説

```python
from subprocess import run, DEVNULL

run('cat flag.txt > ' + input('cat flag.txt > ')[:10], shell=True, stdin=DEVNULL, stdout=DEVNULL, stderr=DEVNULL)
```

このコードの肝は、実行されるコマンドの `stdout` と `stderr` が `DEVNULL` に向けられている点です。普通に `cat flag.txt` を行っても、出力はすべて破棄されます。

## 攻略手順

<details class="spoiler">
<summary>🔍 攻略手順を表示する（ネタバレ注意）</summary>

### /dev/tty によるバイパス

標準出力（stdout）がリダイレクトされていても、プロセスの「制御端末」を指す特殊なデバイスファイル `/dev/tty` に書き込めば、その制限を無視して端末に直接出力できます。

`Dockerfile` を見ると、`socat` で `pty` (疑似端末) と `ctty` (制御端末) が割り当てられているため、この手法が有効です。

### エクスプロイト

入力プロンプトに対して `/dev/tty` と入力します。

```bash
$ nc [host] [port]
cat flag.txt > /dev/tty
Alpaca{...}
```

入力は 9 文字なので、10 文字制限もクリアできます。

</details>

## まとめ

プロセスの標準出力を封じられても、デバイスファイル `/dev/tty` を指定することで端末へ直接書き込めるという、UNIXの仕様を利用したシンプルなパズルでした。