import crc
from typing import cast, Any
from .alphabet import ALPHABET

ALPHABET_MAP = {cp: i for i, cp in enumerate(ALPHABET)}
MAGIC_PREFIX = "ᛝ"
HEADER_BITS = 17
PARITY_BIT = 1
CHECKSUM_BITS = 16

# CRC-16/XMODEM
crc_calculator = crc.Calculator(cast(Any, crc.Crc16.XMODEM))

def encode(payload: bytes) -> str:
    """
    Encodes a byte payload into a Rune-512 string.
    """
    checksum = crc_calculator.checksum(payload)
    
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

    return MAGIC_PREFIX + "".join(encoded_chars)

def _decode_stream_to_int(data_stream: str) -> tuple[int, int]:
    """
    Decodes the an alphabet stream into an integer.
    Returns the decoded integer and the number of bits.
    """
    decoded_int = 0
    num_bits = 0
    for char in data_stream:
        if char in ALPHABET_MAP:
            value = ALPHABET_MAP[char]
            decoded_int = (decoded_int << 9) | value
            num_bits += 9
        else:
            # Stop if we encounter a character not in the alphabet
            break
            
    return decoded_int, num_bits


def decode(encoded_string: str) -> bytes:
    """
    Decodes a Rune-512 string into a byte payload.
    """
    if not encoded_string:
        raise ValueError("Invalid packet: empty string")

    data_stream = encoded_string
    if encoded_string.startswith(MAGIC_PREFIX):
        data_stream = encoded_string[len(MAGIC_PREFIX):]
    else:
        raise ValueError("Invalid magic prefix")

    decoded_int, num_bits = _decode_stream_to_int(data_stream)
    
    if num_bits < HEADER_BITS:
        raise ValueError("Invalid packet: not enough data for header")

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
        raise ValueError("Invalid padding")

    payload_bits = payload_bits_padded - padding_bits
    retrieved_payload_int = retrieved_payload_int_padded >> padding_bits
    
    payload_byte_length = payload_bits // 8

    # Handle case where payload is empty
    if payload_byte_length == 0:
        retrieved_payload = b""
    else:
        retrieved_payload = retrieved_payload_int.to_bytes(payload_byte_length, 'big')

    calculated_checksum = crc_calculator.checksum(retrieved_payload)

    if calculated_checksum != retrieved_checksum:
        raise ValueError("Checksum mismatch: data is corrupt")

    return retrieved_payload
