import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { encode, decode } from './lib.js';

async function main() {
    yargs(hideBin(process.argv))
        .command('encode [string]', 'Encode a string', (yargs) => {
            return yargs
                .positional('string', {
                    describe: 'The string to encode. Reads from stdin if not provided.',
                    type: 'string'
                })
                .option('hex', {
                    alias: 'h',
                    describe: 'Interpret the input as a hex-encoded string.',
                    type: 'boolean'
                })
        }, async (argv) => {
            let inputString = argv.string;
            if (inputString === undefined) {
                inputString = readFileSync(0, 'utf-8').trim();
            }

            let inputBytes: Uint8Array;
            if (argv.hex) {
                try {
                    inputBytes = Buffer.from(inputString, 'hex');
                } catch (e) {
                    console.error('error: invalid hex string');
                    process.exit(1);
                }
            } else {
                inputBytes = new TextEncoder().encode(inputString);
            }

            const encoded = await encode(inputBytes);
            console.log(encoded);
        })
        .command('decode [string]', 'Decode a string', (yargs) => {
            return yargs
                .positional('string', {
                    describe: 'The string to decode. Reads from stdin if not provided.',
                    type: 'string'
                })
                .option('hex', {
                    alias: 'h',
                    describe: 'Output the result as a hex-encoded string.',
                    type: 'boolean'
                })
        }, async (argv) => {
            let inputString = argv.string;
            if (!inputString) {
                inputString = readFileSync(0, 'utf-8').trim();
            }

            try {
                const [decoded] = await decode(inputString);
                if (argv.hex) {
                    console.log(Buffer.from(decoded).toString('hex'));
                } else {
                    console.log(new TextDecoder().decode(decoded));
                }
            } catch (e: any) {
                console.error(`error: ${e.message}`);
                process.exit(1);
            }
        })
        .demandCommand(1, 'You need at least one command before moving on')
        .help()
        .argv;
}

main();
