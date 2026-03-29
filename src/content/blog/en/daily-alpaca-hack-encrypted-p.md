---
title: "Encrypted-P"
description: "Daily AlpacaHack: 2026/03/27"
pubDate: 2026-03-29
category: "daily-alpacahack"
tags: ["ctf", "security", "crypt"]
difficulty: "Easy"
draft: false
---

# Encrypted-P

WriteUp for the `encrypted-p` challenge from 2026/03/27.

## Overview

A CTF challenge exploiting properties of the RSA cryptosystem.
The private key material (prime `p`) is indirectly leaked, allowing the ciphertext to be decrypted.
[Challenge link](https://alpacahack.com/daily/challenges/encrypted-p)

## Code Walkthrough

[This code](#backup) encrypts the FLAG using RSA and outputs the ciphertext along with the public key.
Let's walk through it step by step.

### 1. Generating Key Material

```python
# Convert FLAG (plaintext) to an integer
m = bytes_to_long(os.getenv("FLAG", "Alpaca{REDACTED}").encode())
# Generate two large 512-bit primes
p = getPrime(512)
q = getPrime(512)
```

In RSA, you start by preparing two large primes `p` and `q`.
These are the "ingredients" of the private key and must never be exposed.

### 2. Creating the Public Key

```python
n = p * q       # Product of p and q (made public)
e = 65537       # Encryption exponent (made public)
```

The pair `(n, e)` is the "public key."
Anyone can know `n`, but factoring `n` back into `p` and `q` is astronomically difficult — that's the foundation of RSA's security.

### 3. Encryption

```python
c1 = pow(m, e, n)   # Encrypt the FLAG
c2 = pow(p, e, n)   # ← The problem! Encrypting p and making it public
```

`c1` is the ciphertext of the FLAG — standard RSA encryption.
However, `c2` is **the prime `p` encrypted with RSA**.
At first glance you might think "it's encrypted, so it should be safe," but this introduces a critical vulnerability (explained below).


## Solution Steps

<details class="spoiler">
<summary>🔍 Show Solution Steps (Spoiler Warning)</summary>

### 1. Reviewing the Output

The challenge provides the following four values:

| Value | Meaning | Secret/Public |
|---|---|---|
| `n` | p × q | Public |
| `e` | Encryption exponent | Public |
| `c1` | FLAG ciphertext `pow(m, e, n)` | Public |
| `c2` | p ciphertext `pow(p, e, n)` | Public (← should never happen) |

In normal RSA, recovering `p` from `n` is infeasible.
But here, `c2 = pow(p, e, n)` is additionally provided.

### 2. Finding the Vulnerability

There's a key mathematical property at play here.

Since `n = p × q`, `p` is a divisor of `n`.
The remainder of `p` divided by `n` is just `p` itself (because `p < n`).

Applying this to the encryption formula:

```
c2 = pow(p, e, n)
   = p^e mod n
```

Since `p` is a factor of `n`, `p^e` also contains the factor `p`.
Specifically, `p^e mod n` is always a multiple of `p`.

Therefore:

```python
p = gcd(c2, n)  # Taking the GCD of c2 and n reveals p
```

`gcd` (Greatest Common Divisor) can be computed instantly.
Once `p` is known, `q = n // p` follows, and the private key is fully recoverable.

> An analogy for web engineers:
> Publishing a password hash is safe,
> but publishing "a value derived from the password in a specific way"
> can allow reverse-engineering through its relationship with the original.

</details>

<details class="spoiler">
<summary>💻 Show Exploit (Spoiler Warning)</summary>

### 3. Exploit

Once `p` is recovered, the rest is standard RSA decryption.

```python
from math import gcd
from Crypto.Util.number import long_to_bytes

# Given values (challenge output)
n = 128951281305588745177398666629581199631058485864966572111701156939267450500461527200369468573426631836231657529006961512763025035249904387307870700668785175314961077286667575866244736508708739350133249344265003181706608358459178127198312194766478590857197619309351373290212091866616979044480765203518287880231
e = 65537
c1 = 54584723810742525332842344311000852588602730106620353769829210613572823180653937528363454036086393048077676074759109894318976797773129779455362292423939574494740847776236268109008206494521359064552627895524641251831367406439093727541197347429866604384086035828634392203445282651867426691962843204295565063110
c2 = 1275053191052289311623571273789725721667869401026425104630717220610992153205486162391947489891617470912363657454340060212607860799074584462787330453990545702469206778960092594048128793161645208662908619530980792732439888903918520029492353921753829884907087387587329511678531595496711467707727494180922007863

# Step 1: Recover p via GCD of c2 and n
p = gcd(c2, n)
q = n // p

# Step 2: Compute private key d
#   Calculate φ(n) = (p-1)(q-1), then find the modular inverse of e
phi = (p - 1) * (q - 1)
d = pow(e, -1, phi)

# Step 3: Decrypt the FLAG
m = pow(c1, d, n)
print(long_to_bytes(m).decode())
```

This yields the FLAG.

</details>


## Background Knowledge

#### What is RSA?

A type of `public-key cryptography` widely used in internet communications (HTTPS, etc.).

> Anyone can encrypt data using the `public key`
> Only the holder of the `private key` can decrypt it

If you're a web engineer, you're already familiar with "SSH keys" and "SSL certificates" — they're built on this very mechanism.

##### How RSA Keys Are Generated (Simplified)

1. Randomly generate two large primes `p` and `q`
2. Compute `n = p × q` (this becomes part of the public key)
3. Compute `φ(n) = (p-1) × (q-1)` (Euler's totient function, explained below)
4. Choose `e` (typically 65537) as the encryption exponent
5. Compute `d = modular inverse of e mod φ(n)` (this is the private key)

Only `(n, e)` is made public. `p`, `q`, and `d` are kept secret.

##### Why Is It Secure?

Security relies on the fact that "recovering `p` and `q` from `n` (i.e., factoring `n`) is practically impossible."
The product of two 512-bit primes is a 1024-bit number (roughly 300 digits), and factoring it would take an astronomical amount of time with current computers.

Conversely, the moment either `p` or `q` is leaked, the other is instantly found via `q = n / p`, and the private key `d` can be reconstructed.
This challenge is exactly that scenario.

#### Euler's Totient Function (φ)

##### What It Represents
> φ(n) represents "the count of integers from 1 to n-1 that are coprime with n (i.e., share no common divisor other than 1)."

> Coprime means, for example, 8 and 15 share no common divisor other than 1, so they are coprime.
> When n = p·q (where p and q are primes), φ(n) = (p-1)·(q-1).

##### Why RSA Needs It

RSA decryption requires the "modular inverse of `e`", called `d`.
The formula is `d = e⁻¹ mod φ(n)` — without φ(n), `d` cannot be computed.

Why does φ(n) make this work? Because of Euler's theorem:

```
m^φ(n) ≡ 1 (mod n)
```

This means "raising any number m to the power of φ(n) gives 1 in the mod n world."
Think of it like an array index wrapping around back to the start.

Thanks to this property, decryption works:

```
Encryption: c = m^e mod n
Decryption: m = c^d mod n = m^(e·d) mod n
```

Since `e·d ≡ 1 (mod φ(n))`, we can write `e·d = 1 + k·φ(n)`, so:

```
m^(e·d) = m^(1 + k·φ(n)) = m · (m^φ(n))^k = m · 1^k = m
```

We get back the original plaintext `m`. In essence, φ(n) tells us the "cycle length" — how many multiplications it takes to loop back to the start.

##### In Summary

- φ(n) = the foundation for computing the decryption key `d`
- Knowing φ(n) requires `p` and `q` → that's why `p`, `q` must stay secret
- Knowing φ(n) = can build the private key = can break the encryption

#### GCD (Greatest Common Divisor)

`gcd(a, b)` is "the largest integer that divides both a and b."

```
gcd(12, 8) = 4
gcd(15, 9) = 3
gcd(7, 13) = 1  ← coprime
```

In this exploit, `gcd(c2, n)` extracts `p`.
Since `c2` is `p^e mod n`, it's a multiple of `p`. And `n` is `p × q`, also a multiple of `p`.
The common factor `p` shared by both is what `gcd` finds.


## Summary

This challenge presented a scenario where "the prime `p`, a key ingredient of the RSA private key, was encrypted and made public."

At first glance, encrypting `p` seems safe. But because `p` is a factor of `n`, a single `gcd` call recovers `p` instantly. Encryption is meaningless if the mathematical relationship with the public key `n` remains intact.

This is a lesson that applies to the web world too. Secret information isn't safe just because it's "encrypted before being published" — not publishing it at all is the best defense.


#### BACKUP

[python playground](https://programiz.pro/ide/python)

```python
import os
from Crypto.Util.number import getPrime, bytes_to_long

m = bytes_to_long(os.getenv("FLAG", "Alpaca{REDACTED}").encode())
p = getPrime(512)
q = getPrime(512)
n = p * q
e = 65537
c1 = pow(m, e, n)
c2 = pow(p, e, n)

assert m < n

print(f"n = {n}")
print(f"e = {e}")
print(f"c1 = {c1}")
print(f"c2 = {c2}")
```

```txt
n = 128951281305588745177398666629581199631058485864966572111701156939267450500461527200369468573426631836231657529006961512763025035249904387307870700668785175314961077286667575866244736508708739350133249344265003181706608358459178127198312194766478590857197619309351373290212091866616979044480765203518287880231
e = 65537
c1 = 54584723810742525332842344311000852588602730106620353769829210613572823180653937528363454036086393048077676074759109894318976797773129779455362292423939574494740847776236268109008206494521359064552627895524641251831367406439093727541197347429866604384086035828634392203445282651867426691962843204295565063110
c2 = 1275053191052289311623571273789725721667869401026425104630717220610992153205486162391947489891617470912363657454340060212607860799074584462787330453990545702469206778960092594048128793161645208662908619530980792732439888903918520029492353921753829884907087387587329511678531595496711467707727494180922007863
```