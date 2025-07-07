import sys
import argparse
from .lib import encode, decode
from . import RuneError

def main():
    parser = argparse.ArgumentParser(
        prog="base-eggplant",
        description="""
        base-eggplant: a binary encoding that uses a 512-character alphabet
        for fun and profit.
        """,
    )
    subparsers = parser.add_subparsers(dest="command")

    parser_encode = subparsers.add_parser("encode", help="Encode a string.")
    parser_encode.add_argument("string", nargs="?", help="The string to encode. Reads from stdin if not provided.")
    parser_encode.add_argument(
        "--hex",
        action="store_true",
        help="Interpret the input as a hex-encoded string.",
    )

    parser_decode = subparsers.add_parser("decode", help="Decode a string.")
    parser_decode.add_argument("string", nargs="?", help="The string to decode. Reads from stdin if not provided.")
    parser_decode.add_argument(
        "--hex",
        action="store_true",
        help="Output the result as a hex-encoded string.",
    )

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(0)

    if args.command == "encode":
        input_string = ""
        if args.string is None:
            input_string = sys.stdin.read().strip()
        else:
            input_string = args.string
        input_bytes = b""
        if args.hex:
            try:
                input_bytes = bytes.fromhex(input_string)
            except ValueError:
                print("error: invalid hex string", file=sys.stderr)
                sys.exit(1)
        else:
            input_bytes = input_string.encode()
        encoded = encode(input_bytes)
        print(encoded)
    elif args.command == "decode":
        input_string = ""
        if args.string is None:
            input_string = sys.stdin.read().strip()
        else:
            input_string = args.string
        try:
            decoded, _ = decode(input_string)
            if args.hex:
                print(decoded.hex())
            else:
                print(decoded.decode())
        except RuneError as e:
            print(f"error: {e}", file=sys.stderr)
            sys.exit(1)

if __name__ == "__main__":
    main()
