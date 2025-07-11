# Rune-512: A Compact Binary Encoding Scheme

**Rune-512** is a binary-to-text encoding scheme designed to safely and compactly embed arbitrary binary data in environments with strict character limits that also support a wide range of Unicode characters, such as social media bios (like Bluesky or Twitter).

It uses a carefully selected 512-character symbolic Unicode alphabet that is not visually distracting and can represent data more densely than traditional encodings like Base64, packing 9 bits of data into a single character.

For example, here's 32 random bytes encoded with Rune-512:

```
⣣⡳⣜▣╎⡇◡━┉◳⠢╖⠿⣺⢔▶⢎⡝╺⡂╍╞▨╿□⣼⣆⢼▤⡖⢀
```

Here's the string `"the fox jumped over the lazy dog"`:

```
⣟▴⣨□┩⠆⣍◞⠐⡪⣪▵▃⡖⢄⠛▻⡥⣤⢁▣⢆⢤⠛⠰╺⣲⢁┣⣶⣠
```

## How It Works

The encoding scheme is designed for both compactness and reliability.

- **9-bit Encoding:** Each character in the 512-symbol alphabet represents a 9-bit value. This allows for a denser packing of data compared to 6-bit encodings like Base64.
- **Header and Checksum:** An 18-bit header is included in the encoded data. This header contains:
    - A 17-bit **checksum** derived from the SHA-256 hash of the payload to ensure data integrity and detect corruption.
    - A 1-bit **parity flag** to resolve ambiguity in padding length.
- **Padding:** The payload is padded to ensure the total bit length is a multiple of 9, allowing it to be cleanly mapped to the 512-character alphabet.

## Implementations

This repository hosts multiple implementations of the Rune-512 specification.

- **Python:** A mature and stable implementation, published to PyPI.
  - **Location:** [`impls/py/`](./impls/py/)
  - **Status:** [![PyPI version](https://badge.fury.io/py/rune-512.svg)](https://badge.fury.io/py/rune-512)

- **TypeScript:** An implementation for Node.js and browser environments.
  - **Location:** [`impls/ts/`](./impls/ts/)
  - **Status:** [![NPM version](https://badge.fury.io/js/rune-512.svg)](https://badge.fury.io/js/rune-512)

## Limitations

`rune-512` is designed for encoding small to medium-sized binary payloads in text-based environments. It is not intended for all use cases. Please consider the following limitations:

*   **Security:** The SHA-256-derived checksum only protects against accidental data corruption. **It does not provide cryptographic security.** Malicious actors can easily tamper with the data and forge a valid checksum. For applications requiring tamper-resistance, use a solution with cryptographic signatures or MACs (e.g., HMAC-SHA256).

*   **Scalability:** The current implementations load the entire payload into memory. This makes them unsuitable for very large files, as it can lead to high memory usage and potential performance issues. In a server environment, processing excessively large inputs could pose a Denial of Service (DoS) risk. It is recommended to validate and limit input sizes before decoding.