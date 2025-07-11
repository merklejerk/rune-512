import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import { encode, decode, ALPHABET } from '../src/lib.js';
import { ShortPacketError, ChecksumMismatchError } from '../src/errors.js';
import * as crypto from 'crypto';

describe('Rune-512 Encoding and Decoding', () => {

    it('should decode an empty string to an empty payload', async () => {
        const [decoded, consumed] = await decode("");
        expect(new Uint8Array(decoded)).to.deep.equal(new Uint8Array([]));
        expect(consumed).to.equal(0);
    });

    it('should encode and decode an empty payload', async () => {
        const payload = new Uint8Array([]);
        const encoded = await encode(payload);
        const [decoded, consumed] = await decode(encoded);
        expect(new Uint8Array(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    it('should encode and decode a simple payload', async () => {
        const payload = new TextEncoder().encode('hello world');
        const encoded = await encode(payload);
        const [decoded, consumed] = await decode(encoded);
        expect(new Uint8Array(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    it('should handle a more complex payload', async () => {
        const payload = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        const encoded = await encode(payload);
        const [decoded, consumed] = await decode(encoded);
        expect(new Uint8Array(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    for (let i = 0; i < 20; i++) {
        it(`should encode and decode random data (run ${i + 1})`, async () => {
            const payloadLength = Math.floor(Math.random() * 257);
            const payload = crypto.randomBytes(payloadLength);
            const encoded = await encode(payload);
            const [decoded, consumed] = await decode(encoded);
            expect(new Uint8Array(decoded)).to.deep.equal(payload);
            expect(consumed).to.equal(encoded.length);
        });
    }

    it('should fail when decoding a string with only invalid codepoints', async () => {
        await expect(decode("!@#$")).to.be.rejectedWith(ShortPacketError, 'Input contains no valid codepoints.');
    });

    it('should fail when the header is truncated', async () => {
        const encoded = await encode(new TextEncoder().encode('some data'));
        await expect(decode(encoded.slice(0, 3))).to.be.rejectedWith(ChecksumMismatchError);
    });

    it('should fail with a packet that is too short', async () => {
        const encoded = await encode(new TextEncoder().encode('short'));
        await expect(decode(encoded.slice(0, 1))).to.be.rejectedWith(ShortPacketError);
    });

    it('should fail when the checksum is incorrect', async () => {
        const encoded = await encode(new TextEncoder().encode('some data'));
        const originalCharIndex = ALPHABET.indexOf(encoded[encoded.length - 1]);
        const tamperedChar = ALPHABET[(originalCharIndex + 16) % ALPHABET.length];
        const tamperedEncoded = encoded.slice(0, -1) + tamperedChar;
        await expect(decode(tamperedEncoded)).to.be.rejectedWith(ChecksumMismatchError);
    });

    it('should fail when the payload is truncated', async () => {
        const encoded = await encode(new TextEncoder().encode('some data'));
        await expect(decode(encoded.slice(0, -1))).to.be.rejectedWith(ChecksumMismatchError);
    });

    it('should fail with extra valid codepoints', async () => {
        const payload = new TextEncoder().encode('hello');
        const encoded = await encode(payload);
        const encodedWithExtra = encoded + ALPHABET[0] + ALPHABET[1];
        await expect(decode(encodedWithExtra)).to.be.rejectedWith(ChecksumMismatchError);
    });

    it('should ignore extra invalid codepoints and report consumed length', async () => {
        const payload = new TextEncoder().encode('hello');
        const encoded = await encode(payload);
        const encodedWithExtra = encoded + "!@#$";
        const [decoded, consumed] = await decode(encodedWithExtra);
        expect(new Uint8Array(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });
});
