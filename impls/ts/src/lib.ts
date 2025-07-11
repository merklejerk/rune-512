import { toBigIntBE, toBufferBE } from './bigint-helpers.js';
import { ALPHABET, ALPHABET_MAP } from './alphabet.js';
import { ShortPacketError, ChecksumMismatchError, InvalidPaddingError } from './errors.js';

const HEADER_BITS = 18;
const PARITY_BIT = 1;
const CHECKSUM_BITS = 17;

async function _calculateChecksum(payload: Uint8Array): Promise<number> {
    let fullHash: ArrayBuffer;

    // Check for browser environment
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        fullHash = await window.crypto.subtle.digest('SHA-256', payload);
    } else {
        // Fallback to Node.js crypto
        const { createHash } = await import('crypto');
        const hasher = createHash('sha256');
        hasher.update(payload);
        fullHash = hasher.digest().buffer;
    }
    
    const fullHashInt = toBigIntBE(new Uint8Array(fullHash));
    return Number(fullHashInt & BigInt((1 << CHECKSUM_BITS) - 1));
}

/**
 * Encodes a byte payload into a Rune-512 string.
 */
export async function encode(payload: Uint8Array): Promise<string> {
    const checksum = await _calculateChecksum(payload);
    
    const totalBits = HEADER_BITS + payload.length * 8;
    const padding = (9 - (totalBits % 9)) % 9;
    
    const parityBit = padding === 8 ? 1 : 0;
    
    const header = (parityBit << CHECKSUM_BITS) | checksum;
    
    let binaryPacketInt = (BigInt(header) << BigInt(payload.length * 8)) | toBigIntBE(payload);
    
    const paddedBits = totalBits + padding;
    binaryPacketInt = binaryPacketInt << BigInt(padding);
    
    const encodedChars: string[] = [];
    
    // Process the integer in 9-bit chunks
    for (let i = 0; i < Math.ceil(paddedBits / 9); i++) {
        const shift = BigInt(paddedBits - (i + 1) * 9);
        const chunk = Number((binaryPacketInt >> shift) & 0x1FFn);
        encodedChars.push(ALPHABET[chunk]);
    }
    
    return encodedChars.join('');
}

/**
 * Decodes the alphabet stream into an integer.
 * Returns the decoded integer, the number of bits, and codepoints consumed.
 */
function decodeStreamToInt(dataStream: string): [bigint, number, number] {
    let decodedInt = 0n;
    let numBits = 0;
    let codepointsConsumed = 0;
    
    for (const char of dataStream) {
        const value = ALPHABET_MAP.get(char);
        if (value !== undefined) {
            decodedInt = (decodedInt << 9n) | BigInt(value);
            numBits += 9;
            codepointsConsumed++;
        } else {
            // Stop if we encounter a character not in the alphabet
            break;
        }
    }
    
    return [decodedInt, numBits, codepointsConsumed];
}

/**
 * Decodes a Rune-512 string into a byte payload.
 * Returns the payload and the number of codepoints consumed.
 */
export async function decode(encodedString: string): Promise<[Uint8Array, number]> {
    if (!encodedString) {
        return [new Uint8Array(), 0];
    }
    
    const [decodedInt, numBits, codepointsConsumed] = decodeStreamToInt(encodedString);
    
    if (numBits === 0) {
        throw new ShortPacketError('Input contains no valid codepoints.');
    }

    if (numBits < HEADER_BITS) {
        throw new ShortPacketError('Invalid packet: not enough data for header');
    }
    
    const payloadBitsPadded = numBits - HEADER_BITS;
    
    const headerInt = decodedInt >> BigInt(payloadBitsPadded);
    const parityBit = Number(headerInt >> BigInt(CHECKSUM_BITS));
    const retrievedChecksum = Number(headerInt & BigInt((1 << CHECKSUM_BITS) - 1));
    
    const payloadMask = (1n << BigInt(payloadBitsPadded)) - 1n;
    const retrievedPayloadIntPadded = decodedInt & payloadMask;
    
    let paddingBits = payloadBitsPadded % 8;
    
    if (paddingBits === 0 && parityBit === 1) {
        paddingBits = 8;
    }
    
    if (payloadBitsPadded < paddingBits) {
        throw new InvalidPaddingError();
    }
    
    const payloadBits = payloadBitsPadded - paddingBits;
    const retrievedPayloadInt = retrievedPayloadIntPadded >> BigInt(paddingBits);
    
    const payloadByteLength = Math.floor(payloadBits / 8);
    
    const retrievedPayload = toBufferBE(retrievedPayloadInt, payloadByteLength);
    
    const calculatedChecksum = await _calculateChecksum(retrievedPayload);
    
    if (calculatedChecksum !== retrievedChecksum) {
        throw new ChecksumMismatchError();
    }
    
    return [retrievedPayload, codepointsConsumed];
}

// Export constants for compatibility
export { ALPHABET };
