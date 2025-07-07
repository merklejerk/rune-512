import { expect } from 'chai';
import { encode, decode, ALPHABET } from '../src/lib.js';
import { RuneError } from '../src/errors.js';
import * as crypto from 'crypto';

describe('Rune-512 Encoding and Decoding', () => {

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

    it('should fail with an invalid prefix', () => {
        expect(() => decode("invalid_prefix")).to.throw(RuneError, 'Invalid magic prefix');
        try {
            decode("invalid_prefix");
        } catch (e: any) {
            expect(e).to.be.an.instanceOf(RuneError);
            expect(e.code).to.equal('INVALID_PREFIX');
        }
    });

    it('should fail with a packet that is too short', () => {
        const encoded = encode(Buffer.from('short'));
        expect(() => decode(encoded.slice(0, 1))).to.throw(RuneError, 'Invalid packet: not enough data for header');
        try {
            decode(encoded.slice(0, 1));
        } catch (e: any) {
            expect(e).to.be.an.instanceOf(RuneError);
            expect(e.code).to.equal('SHORT_PACKET');
        }
    });

    it('should fail when the checksum is incorrect', () => {
        const encoded = encode(Buffer.from('some data'));
        const tamperedChar = ALPHABET.includes('b') ? 'a' : 'b';
        const tamperedEncoded = encoded.slice(0, -1) + tamperedChar;
        expect(() => decode(tamperedEncoded)).to.throw(RuneError, 'Checksum mismatch: data is corrupt');
        try {
            decode(tamperedEncoded);
        } catch (e: any) {
            expect(e).to.be.an.instanceOf(RuneError);
            expect(e.code).to.equal('CHECKSUM_MISMATCH');
        }
    });

    it('should fail when the payload is truncated', () => {
        const encoded = encode(Buffer.from('some data'));
        expect(() => decode(encoded.slice(0, -1))).to.throw(RuneError, 'Checksum mismatch: data is corrupt');
        try {
            decode(encoded.slice(0, -1));
        } catch (e: any) {
            expect(e).to.be.an.instanceOf(RuneError);
            expect(e.code).to.equal('CHECKSUM_MISMATCH');
        }
    });

    it('should fail with extra valid codepoints', () => {
        const payload = Buffer.from('hello');
        const encoded = encode(payload);
        const encodedWithExtra = encoded + ALPHABET[0] + ALPHABET[1];
        expect(() => decode(encodedWithExtra)).to.throw(RuneError, 'Checksum mismatch: data is corrupt');
        try {
            decode(encodedWithExtra);
        } catch (e: any) {
            expect(e).to.be.an.instanceOf(RuneError);
            expect(e.code).to.equal('CHECKSUM_MISMATCH');
        }
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
