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

WriteUp for the `silence` challenge from 2026/03/31.

## Overview

A "Jail" challenge written in Python. You need to read the flag even though the command's execution results (stdout and stderr) are redirected to `/dev/null`.

[Challenge link](https://alpacahack.com/daily/challenges/silence)

## Code Walkthrough

```python
from subprocess import run, DEVNULL

run('cat flag.txt > ' + input('cat flag.txt > ')[:10], shell=True, stdin=DEVNULL, stdout=DEVNULL, stderr=DEVNULL)
```

The core of this challenge is that `stdout` and `stderr` of the executed command are directed to `DEVNULL`. Simply running `cat flag.txt` won't show anything as all output is discarded.

## Solution Steps

<details class="spoiler">
<summary>🔍 Show Solution Steps (Spoiler Warning)</summary>

### Bypassing via /dev/tty

Even when standard output (stdout) is redirected, you can bypass this by writing to `/dev/tty`, a special device file that refers to the "controlling terminal" of the process. Writing here sends data directly to the terminal, ignoring any redirections.

Looking at the `Dockerfile`, `socat` is used with `pty` (pseudo-terminal) and `ctty` (controlling terminal) options, which makes this technique possible.

### Exploit

Enter `/dev/tty` at the input prompt.

```bash
$ nc [host] [port]
cat flag.txt > /dev/tty
Alpaca{...}
```

The input is 9 characters long, which fits within the 10-character limit.

</details>

## Summary

A simple puzzle using UNIX device file specifications. Even if the standard output of a process is silenced, you can still write directly to the terminal by specifying `/dev/tty`.
