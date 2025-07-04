# Rune-512: A Compact Binary Encoding Scheme

**Rune-512** is a binary-to-text encoding scheme designed to safely and compactly embed arbitrary binary data in environments with strict character limits that also support a wide range of Unicode characters, such as social media bios (like Bluesky or Twitter).

It uses a carefully selected 512-character symbolic Unicode alphabet that is not visually distracting and can represent data more densely than traditional encodings like Base64, packing 9 bits of data into a single character.

For example, here's 32 random bytes encoded with Rune-512:

```
ᛝ⠅┯⡊⡋⢜⢴⣗▮⢌▟⣣┘▊⡼╋⢱⣜▧⣎━▋◰╾╧□⠜◡⢎⣙⠴▀
```

Here's the string `"the fox jumped over the lazy dog"`:

```
ᛝ⠟ ⡋⡑◣┦◻⢥┇⡖⠑⢡┇◗╊◞┪┹⢦◈◠┍⡬⢅⣇┤⡻⠶⠡⠨⡳⢿◣⡂◎◱⢩▵⣡⢊⣛⡉⣖⠔┭⣣○⣛┃⢒┯⡫╧⠲▊◃▲⣷⠹⢠
```

## How It Works

The encoding scheme is designed for both compactness and reliability.

- **9-bit Encoding:** Each character in the 512-symbol alphabet represents a 9-bit value. This allows for a denser packing of data compared to 6-bit encodings like Base64.
- **Magic Prefix:** Encoded strings are prepended with the `ᛝ` (Ingwaz) rune, which serves as a "magic prefix" for easy identification.
- **Header and Checksum:** A 17-bit header is included in the encoded data. This header contains:
    - A 16-bit **CRC-16/XMODEM checksum** to ensure data integrity and detect corruption.
    - A 1-bit **parity flag** to resolve ambiguity in padding length.
- **Padding:** The payload is padded to ensure the total bit length is a multiple of 9, allowing it to be cleanly mapped to the 512-character alphabet.

## Implementations

This repository hosts multiple implementations of the Rune-512 specification.

- **Python:** A mature and stable implementation, published to PyPI.
  - **Location:** [`impls/py/`](./impls/py/)
  - **Status:** [![PyPI version](https://badge.fury.io/py/rune-512.svg)](https://badge.fury.io/py/rune-512)

- **TypeScript:** An implementation for Node.js and browser environments.
  - **Location:** [`impls/ts/`](./impls/ts/)
  - **Status:** Coming soon!