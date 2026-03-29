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

WriteUp for the `dot-chain` challenge from 2026/03/29.

## Overview

A challenge where you achieve Remote Code Execution (RCE) from a JavaScript `eval()` sandbox using only a restricted character set to read the flag.
This is a "JS Jail" style CTF challenge.
Challenge link: [LINK](https://alpacahack.com/daily/challenges/dot-chain)

## Code Walkthrough

The server-side code is as follows:

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

It takes a string from stdin and executes it with `eval()`, but there's a regex check right before that.

At first glance, it looks like only dots (`.`), digits (`0-9`), and alphabetic characters (`A-Z`, `a-z`) are allowed.
Since parentheses `()` and spaces can't be used, it seems impossible to call any functions... or does it?

## Solution Steps

<details class="spoiler">
<summary>🔍 Show Solution Steps (Spoiler Warning)</summary>

### 1. Spotting the Regex Trap

The biggest loophole lies in the input validation regex `/^[.0-9A-z]+$/`.

To allow alphabetic characters, the correct way is `A-Za-z`, but here it's written as `A-z`.
In the ASCII table, between uppercase `Z` (code 90) and lowercase `a` (code 97), several symbols exist:

```
[ (91)  \ (92)  ] (93)  ^ (94)  _ (95)  ` (96)
```

This means backticks `` ` `` and backslashes `\` are also accepted by the regex.

### 2. Calling Functions Without Parentheses

To output the flag, we'd want to run something like `console.log()`, but `(` and `)` aren't allowed.
This is where JavaScript's "tagged template literals" and the now-permitted backtick come in.

```js
// Normal function call
func(arg)

// Tagged template literal (no parentheses needed)
func`arg`
```

### 3. Generating and Executing Arbitrary Code

To evaluate arbitrary code, we use the `Function` constructor.

```js
Function`console.log(process.env.FLAG)`
```

This generates `function() { console.log(process.env.FLAG) }`.
However, the argument contains `()` and spaces, which would be rejected by the regex.

### 4. Restoring Symbols via Unicode Escapes

Using the permitted backslash `\`, we convert blocked characters into Unicode escape sequences.

```
(  →  \u0028
)  →  \u0029
```

Combining these lets us completely bypass the filter.

</details>

<details class="spoiler">
<summary>💻 Show Exploit (Spoiler Warning)</summary>

### 5. Exploit

The final payload looks like this:

```js
Function`console.log\u0028process.env.FLAG\u0029```
```

How it works:

1. The left side `` Function`...` `` is evaluated — Unicode escapes are interpreted and an anonymous function executing `console.log(process.env.FLAG)` is generated
2. The right side empty backticks ` `` ` immediately invoke the generated function
3. The FLAG stored in the server's environment variables is printed to stdout

Connect to the challenge server via `nc` and enter this payload at the prompt to capture the flag.

</details>

## Background Knowledge

#### Regex Character Classes (The `A-z` Trap)

The regex `[A-z]` means "ASCII code 65 (`A`) through 122 (`z`)."
Symbols between them (`[`, `\`, `]`, `^`, `_`, `` ` ``) also match, so to restrict to alphabetic characters only, `[A-Za-z]` is the correct form.

#### Tagged Template Literals

In JavaScript, placing a template literal (backtick-enclosed string) right after a function name calls the function without parentheses.

```js
// These two behave similarly
alert("hello")
alert`hello`
```

This is a go-to technique in JS Jail challenges when parentheses `()` are restricted.

#### Function Constructor

`Function('code')` dynamically creates a new function with the given string as its body.
Similar to `eval`, but easier to combine with tagged template literals.

```js
const fn = Function("return 1 + 2");
fn(); // 3
```

#### Unicode Escape Sequences

In JavaScript, `\uXXXX` (4-digit hex) can represent any Unicode character.
This is a commonly used technique for bypassing input filters and WAFs.

```js
"\u0041"          // "A"
"\u0028"          // "("
console.log\u0028\u0029  // equivalent to console.log()
```


## Summary

A scenario where a developer's small regex mistake (writing `A-z` instead of `A-Za-z`) leads to critical Remote Code Execution (RCE).

As a JS Jail challenge, it has an elegant structure that tests knowledge of JavaScript's flexible syntax — tagged template literals and Unicode escapes. A good reminder to be careful with character class ranges when writing regex.


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
