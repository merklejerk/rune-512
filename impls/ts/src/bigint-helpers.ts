import { Buffer } from 'buffer';

/**
 * Converts a Buffer to a BigInt in big-endian format.
 */
export function toBigIntBE(buf: Buffer): bigint {
    let result = 0n;
    for (const byte of buf) {
        result = (result << 8n) | BigInt(byte);
    }
    return result;
}

/**
 * Converts a BigInt to a Buffer in big-endian format.
 */
export function toBufferBE(num: bigint, width: number): Buffer {
    if (width === 0) {
        return Buffer.alloc(0);
    }
    const bytes = new Uint8Array(width);
    for (let i = width - 1; i >= 0; i--) {
        bytes[i] = Number(num & 0xffn);
        num >>= 8n;
    }
    return Buffer.from(bytes);
}
