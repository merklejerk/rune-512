import { expect } from 'chai';
import { encode, decode, ALPHABET } from '../src/lib.js';
import { ShortPacketError, ChecksumMismatchError } from '../src/errors.js';
import * as crypto from 'crypto';

describe('Rune-512 Encoding and Decoding', () => {

    it('should decode an empty string to an empty payload', () => {
        const [decoded, consumed] = decode("");
        expect(Buffer.from(decoded)).to.deep.equal(Buffer.from([]));
        expect(consumed).to.equal(0);
    });

    it('should encode and decode an empty payload', () => {
        const payload = Buffer.from([]);
        const encoded = encode(payload);
        const [decoded, consumed] = decode(encoded);
        expect(Buffer.from(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    it('should encode and decode a simple payload', () => {
        const payload = Buffer.from('hello world');
        const encoded = encode(payload);
        const [decoded, consumed] = decode(encoded);
        expect(Buffer.from(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    it('should handle a more complex payload', () => {
        const payload = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
        const encoded = encode(payload);
        const [decoded, consumed] = decode(encoded);
        expect(Buffer.from(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });

    for (let i = 0; i < 20; i++) {
        it(`should encode and decode random data (run ${i + 1})`, () => {
            const payloadLength = Math.floor(Math.random() * 257);
            const payload = crypto.randomBytes(payloadLength);
            const encoded = encode(payload);
            const [decoded, consumed] = decode(encoded);
            expect(Buffer.from(decoded)).to.deep.equal(payload);
            expect(consumed).to.equal(encoded.length);
        });
    }

    it('should fail when decoding a string with only invalid codepoints', () => {
        expect(() => decode("!@#$")).to.throw(ShortPacketError, 'Input contains no valid codepoints.');
    });

    it('should fail when the header is truncated', () => {
        const encoded = encode(Buffer.from('some data'));
        expect(() => decode(encoded.slice(0, 3))).to.throw(ChecksumMismatchError);
    });

    it('should fail with a packet that is too short', () => {
        const encoded = encode(Buffer.from('short'));
        expect(() => decode(encoded.slice(0, 1))).to.throw(ShortPacketError);
    });

    it('should fail when the checksum is incorrect', () => {
        const encoded = encode(Buffer.from('some data'));
        const originalCharIndex = ALPHABET.indexOf(encoded[encoded.length - 1]);
        const tamperedChar = ALPHABET[(originalCharIndex + 16) % ALPHABET.length];
        const tamperedEncoded = encoded.slice(0, -1) + tamperedChar;
        expect(() => decode(tamperedEncoded)).to.throw(ChecksumMismatchError);
    });

    it('should fail when the payload is truncated', () => {
        const encoded = encode(Buffer.from('some data'));
        expect(() => decode(encoded.slice(0, -1))).to.throw(ChecksumMismatchError);
    });

    it('should fail with extra valid codepoints', () => {
        const payload = Buffer.from('hello');
        const encoded = encode(payload);
        const encodedWithExtra = encoded + ALPHABET[0] + ALPHABET[1];
        expect(() => decode(encodedWithExtra)).to.throw(ChecksumMismatchError);
    });

    it('should ignore extra invalid codepoints and report consumed length', () => {
        const payload = Buffer.from('hello');
        const encoded = encode(payload);
        const encodedWithExtra = encoded + "!@#$";
        const [decoded, consumed] = decode(encodedWithExtra);
        expect(Buffer.from(decoded)).to.deep.equal(payload);
        expect(consumed).to.equal(encoded.length);
    });
});
