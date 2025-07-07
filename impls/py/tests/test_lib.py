import pytest
import random
import os
from src.rune_512 import encode, decode, ALPHABET, ChecksumMismatchError, ShortPacketError

def test_decode_empty_string():
    """Tests that decoding an empty string returns an empty payload."""
    decoded, consumed = decode("")
    assert decoded == b''
    assert consumed == 0

def test_encode_decode_empty():
    """Tests encoding and decoding an empty payload."""
    encoded = encode(b'')
    decoded, consumed = decode(encoded)
    assert decoded == b''
    assert consumed == len(encoded)

def test_encode_decode_simple():
    """Tests encoding and decoding a simple payload."""
    payload = b'hello world'
    encoded = encode(payload)
    decoded, consumed = decode(encoded)
    assert decoded == payload
    assert consumed == len(encoded)

def test_encode_decode_complex():
    """Tests a more complex payload."""
    payload = b'\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f'
    encoded = encode(payload)
    decoded, consumed = decode(encoded)
    assert decoded == payload
    assert consumed == len(encoded)

@pytest.mark.parametrize("execution_number", range(20))
def test_encode_decode_random(execution_number):
    """Tests encoding and decoding with random data of random lengths."""
    # Use a different seed for each run, but keep it deterministic
    random.seed(execution_number)
    
    payload_length = random.randint(0, 256) 
    payload = os.urandom(payload_length)
    
    encoded = encode(payload)
    decoded, consumed = decode(encoded)
    
    assert decoded == payload
    assert consumed == len(encoded)

def test_decode_invalid_codepoints_only():
    """Tests that decoding a string with only invalid codepoints fails."""
    with pytest.raises(ShortPacketError):
        decode("!@#$")

def test_truncated_header():
    """Tests that decoding fails when the header is truncated."""
    encoded = encode(b'some data')
    # Truncate the encoded string to a length that is shorter than a full header
    with pytest.raises(ChecksumMismatchError):
        decode(encoded[:3]) # A header is at least 2 codepoints, but data makes it longer

def test_short_packet():
    """Tests that decoding fails with a packet that is too short."""
    # This will encode to something, but we'll truncate it to be too short.
    encoded = encode(b'short')
    with pytest.raises(ShortPacketError):
        decode(encoded[:1])

def test_checksum_mismatch():
    """Tests that decoding fails when the checksum is incorrect."""
    encoded = encode(b'some data')
    # Tamper with the encoded data to cause a checksum mismatch
    # Flipping the last character should be enough
    original_char_index = ALPHABET.index(encoded[-1])
    tampered_char = ALPHABET[(original_char_index + 16) % len(ALPHABET)]
    tampered_encoded = encoded[:-1] + tampered_char
    with pytest.raises(ChecksumMismatchError):
        decode(tampered_encoded)

def test_truncated_payload():
    """Tests that decoding fails when the payload is truncated."""
    encoded = encode(b'some data')
    # Truncate the payload part of the encoded string
    with pytest.raises(ChecksumMismatchError):
        decode(encoded[:-1])

def test_extra_valid_codepoints():
    """Tests that extra valid codepoints cause a checksum mismatch."""
    payload = b'hello'
    encoded = encode(payload)
    
    # Add extra valid characters that are part of the alphabet
    encoded_with_extra = encoded + ALPHABET[0] + ALPHABET[1]
    
    with pytest.raises(ChecksumMismatchError):
        decode(encoded_with_extra)

def test_extra_invalid_codepoints_are_ignored():
    """Tests that extra invalid codepoints are ignored and reported."""
    payload = b'hello'
    encoded = encode(payload)
    
    # Add extra invalid characters
    encoded_with_extra = encoded + "!@#$"
    
    decoded, consumed = decode(encoded_with_extra)
    
    assert decoded == payload
    assert consumed == len(encoded)
