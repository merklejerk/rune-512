# Rune-512: Compact Binary Encoding for TypeScript

[![NPM version](https://badge.fury.io/js/rune-512.svg)](https://badge.fury.io/js/rune-512)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Rune-512** is a binary-to-text encoding scheme designed to safely and compactly embed arbitrary binary data in environments with strict character limits but also support a wide range of Unicode characters, such as social media bios (like Bluesky, Twitter).

It uses a carefully selected 512-character symbolic unicode alphabet that is not visually distracting and can represent data more densely than traditional encodings like Base64, packing 9 bits of data into a single character.

For example, here's 32 random bytes:

```
⣣⡳⣜▣╎⡇◡━┉◳⠢╖⠿⣺⢔▶⢎⡝╺⡂╍╞▨╿□⣼⣆⢼▤⡖⢀
```

Here's the string `"the fox jumped over the lazy dog"`:

```
⣟▴⣨□┩⠆⣍◞⠐⡪⣪▵▃⡖⢄⠛▻⡥⣤⢁▣⢆⢤⠛⠰╺⣲⢁┣⣶⣠
```

## Features

- **Compact:** Encodes 9 bits per character, offering significant space savings over Base64.
- **Reliable:** Uses a 17-bit checksum derived from the SHA-256 hash of the payload to detect data corruption.
- **Safe:** The alphabet consists of Unicode codepoints with wide compatibility across common platforms.
- **Universal:** Runs in both Node.js and modern browser environments.
- **Easy to Use:** Provides a simple command-line interface and a straightforward TypeScript library with proper error handling.

## Installation

Install `rune-512` from NPM:

```bash
npm install rune-512
```

## Usage

### Command-Line Interface

The package provides a CLI for easy encoding and decoding from your terminal.

#### Encoding

To encode a string:
```bash
npx rune-512 encode "hello world"
# Output: ⣦◩⣐▕╣⣆◤⠝▷╲⣘▐
```

To encode a hex string, use the `--hex` flag:
```bash
npx rune-512 encode --hex "deadbeef"
# Output: ⢜╓▽⢶◷⣰
```

You can also pipe data from stdin:
```bash
echo "some data" | npx rune-512 encode
# Output: ⠘⡴◍╻⣖⢤⠙⠰╴⣂
```

#### Decoding

To decode a `rune-512` string:
```bash
npx rune-512 decode "⣦◩⣐▕╣⣆◤⠝▷╲⣘▐"
# Output: hello world
```

To decode to a hex string, use the `--hex` flag:
```bash
npx rune-512 decode --hex "⢜╓▽⢶◷⣰"
# Output: deadbeef
```

### Library

You can also use `rune-512` as a library in your TypeScript or JavaScript projects.

#### Encoding

To encode a byte array (`Uint8Array`):

```typescript
import { encode } from 'rune-512';

const payload = new TextEncoder().encode('hello world');
const encodedString = encode(payload);
console.log(encodedString);
// Output: ⣦◩⣐▕╣⣆◤⠝▷╲⣘▐
```

#### Decoding

To decode a string:

```typescript
import { decode, RuneError } from 'rune-512';

const encodedString = '⣦◩⣐▕╣⣆◤⠝▷╲⣘▐';

try {
    const [payload, codepointsConsumed] = decode(encodedString);
    console.log(new TextDecoder().decode(payload));
    // Output: hello world
    console.log(`Consumed ${codepointsConsumed} codepoints.`);
    // Output: Consumed 12 codepoints.
} catch (e) {
    if (e instanceof RuneError) {
        console.error(`Decoding failed: ${e.message}`);
    }
}
```

The `decode` function returns a tuple containing the decoded `Uint8Array` and the number of Unicode codepoints consumed from the input string. This is useful for parsing data from streams or larger text blocks that may contain other information.

It is up to the user to decide on a scheme for indicating the start of a valid encoded payload inside of a larger body of text.

## How It Works

A `rune-512` encoded string consists of two parts:

1.  **Header:** An 18-bit section containing a 17-bit checksum derived from the SHA-256 hash of the original payload and a parity bit for padding disambiguation.
2.  **Payload:** The binary data, packed into 9-bit chunks.

Each 9-bit chunk is mapped to a character in the 512-character alphabet. This structure ensures that the data is both compact and verifiable.

## Limitations

`rune-512` is designed for encoding small to medium-sized binary payloads in text-based environments. It is not intended for all use cases. Please consider the following limitations:

*   **Security:** The SHA-256-derived checksum only protects against accidental data corruption. **It does not provide cryptographic security.** Malicious actors can easily tamper with the data and forge a valid checksum. For applications requiring tamper-resistance, use a solution with cryptographic signatures or MACs (e.g., HMAC-SHA256).

*   **Scalability:** The current implementations load the entire payload into memory. This makes them unsuitable for very large files, as it can lead to high memory usage and potential performance issues. In a server environment, processing excessively large inputs could pose a Denial of Service (DoS) risk. It is recommended to validate and limit input sizes before decoding.

## License

This project is licensed under the MIT License. See the `package.json` for details.
