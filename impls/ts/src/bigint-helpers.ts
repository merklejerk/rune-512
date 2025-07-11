/**
 * Converts a BigInt to a big-endian Uint8Array.
 * @param n The BigInt to convert.
 * @param length The desired length of the byte array.
 * @returns A Uint8Array representing the BigInt in big-endian format.
 */
export function toBufferBE(n: bigint, length: number): Uint8Array {
    const result = new Uint8Array(length);
    for (let i = length - 1; i >= 0; i--) {
        result[i] = Number(n & 0xffn);
        n >>= 8n;
    }
    return result;
}

/**
 * Converts a big-endian Uint8Array to a BigInt.
 * @param buf The Uint8Array to convert.
 * @returns A BigInt representing the byte array's value.
 */
export function toBigIntBE(buf: Uint8Array): bigint {
    let result = 0n;
    for (const byte of buf) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}
