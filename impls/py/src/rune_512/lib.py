import hashlib
from typing import cast, Any
from .alphabet import ALPHABET
from .errors import (
    InvalidPaddingError,
    ChecksumMismatchError,
    ShortPacketError,
)

ALPHABET_MAP = {cp: i for i, cp in enumerate(ALPHABET)}
HEADER_BITS = 18
PARITY_BIT = 1
CHECKSUM_BITS = 17

def _calculate_checksum(payload: bytes) -> int:
    """
    Calculates the checksum for the payload.
    """
    hasher = hashlib.sha256()
    hasher.update(payload)
    full_hash = hasher.digest()
    full_hash_int = int.from_bytes(full_hash, 'big')
    return full_hash_int & ((1 << CHECKSUM_BITS) - 1)

def encode(payload: bytes) -> str:
    """
    Encodes a byte payload into a Rune-512 string.
    """
    checksum = _calculate_checksum(payload)
    
    total_bits = HEADER_BITS + len(payload) * 8
    padding = (9 - (total_bits % 9)) % 9

    parity_bit = 1 if padding == 8 else 0

    header = (parity_bit << CHECKSUM_BITS) | checksum
    
    binary_packet_int = (header << (len(payload) * 8)) | int.from_bytes(payload, 'big')
    
    padded_bits = total_bits + padding
    binary_packet_int <<= padding

    encoded_chars = []
    
    # Process the integer in 9-bit chunks
    for i in range((padded_bits + 8) // 9):
        shift = padded_bits - (i + 1) * 9
        chunk = (binary_packet_int >> shift) & 0x1FF
        encoded_chars.append(ALPHABET[chunk])

    return "".join(encoded_chars)

def _decode_stream_to_int(data_stream: str) -> tuple[int, int, int]:
    """
    Decodes the an alphabet stream into an integer.
    Returns the decoded integer, the number of bits, and codepoints consumed.
    """
    decoded_int = 0
    num_bits = 0
    codepoints_consumed = 0
    for char in data_stream:
        if char in ALPHABET_MAP:
            value = ALPHABET_MAP[char]
            decoded_int = (decoded_int << 9) | value
            num_bits += 9
            codepoints_consumed += 1
        else:
            # Stop if we encounter a character not in the alphabet
            break
            
    return decoded_int, num_bits, codepoints_consumed


def decode(encoded_string: str) -> tuple[bytes, int]:
    """
    Decodes a Rune-512 string into a byte payload.
    Returns the payload and the number of codepoints consumed.
    """
    if not encoded_string:
        return b'', 0

    data_stream = encoded_string

    decoded_int, num_bits, stream_codepoints_consumed = _decode_stream_to_int(data_stream)

    if not num_bits:
        raise ShortPacketError("Input contains no valid codepoints.")

    codepoints_consumed = stream_codepoints_consumed
    
    if num_bits < HEADER_BITS:
        raise ShortPacketError("Invalid packet: not enough data for header")

    payload_bits_padded = num_bits - HEADER_BITS
    
    header_int = decoded_int >> payload_bits_padded
    parity_bit = header_int >> CHECKSUM_BITS
    retrieved_checksum = header_int & ((1 << CHECKSUM_BITS) - 1)

    payload_mask = (1 << payload_bits_padded) - 1
    retrieved_payload_int_padded = decoded_int & payload_mask

    padding_bits = payload_bits_padded % 8

    if padding_bits == 0 and parity_bit == 1:
        padding_bits = 8

    if payload_bits_padded < padding_bits:
        raise InvalidPaddingError()

    payload_bits = payload_bits_padded - padding_bits
    retrieved_payload_int = retrieved_payload_int_padded >> padding_bits

    payload_byte_length = payload_bits // 8

    # Handle case where payload is empty
    if payload_byte_length == 0:
        retrieved_payload = b""
    else:
        retrieved_payload = retrieved_payload_int.to_bytes(payload_byte_length, 'big')

    calculated_checksum = _calculate_checksum(retrieved_payload)

    if calculated_checksum != retrieved_checksum:
        raise ChecksumMismatchError()

    return retrieved_payload, codepoints_consumed
