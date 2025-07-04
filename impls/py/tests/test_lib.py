import pytest
import os
import random
from src.rune_512 import encode, decode, ALPHABET

def test_encode_decode_empty():
    """Tests encoding and decoding an empty payload."""
    encoded = encode(b'')
    decoded = decode(encoded)
    assert decoded == b''

def test_encode_decode_simple():
    """Tests encoding and decoding a simple payload."""
    payload = b'hello world'
    encoded = encode(payload)
    decoded = decode(encoded)
    assert decoded == payload

def test_encode_decode_complex():
    """Tests a more complex payload."""
    payload = b'\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f'
    encoded = encode(payload)
    decoded = decode(encoded)
    assert decoded == payload

@pytest.mark.parametrize("execution_number", range(20))
def test_encode_decode_random(execution_number):
    """Tests encoding and decoding with random data of random lengths."""
    # Use a different seed for each run, but keep it deterministic
    random.seed(execution_number)
    
    payload_length = random.randint(0, 256) 
    payload = os.urandom(payload_length)
    
    encoded = encode(payload)
    print(encoded)
    decoded = decode(encoded)
    
    assert decoded == payload

def test_invalid_prefix():
    """Tests that decoding fails with an invalid prefix."""
    with pytest.raises(ValueError, match="Invalid magic prefix"):
        decode("invalid_prefix")

def test_short_packet():
    """Tests that decoding fails with a packet that is too short."""
    # This will encode to something, but we'll truncate it to be too short.
    encoded = encode(b'short')
    with pytest.raises(ValueError, match="Invalid packet: not enough data for header"):
        # The header is 17 bits (2 emojis for a 9-bit alphabet), so 1 emoji is too short.
        decode(encoded[:2])

def test_checksum_mismatch():
    """Tests that decoding fails when the checksum is incorrect."""
    encoded = encode(b'some data')
    # Tamper with the encoded data to cause a checksum mismatch
    # Flipping the last character should be enough
    tampered_encoded = encoded[:-1] + ('a' if encoded[-1] != 'a' else 'b')
    # We need to ensure the character is in the alphabet to avoid a different error
    if tampered_encoded.endswith('a') and 'a' not in ALPHABET:
        tampered_encoded = encoded[:-1] + ALPHABET[0]
    elif tampered_encoded.endswith('b') and 'b' not in ALPHABET:
        tampered_encoded = encoded[:-1] + ALPHABET[0]

    with pytest.raises(ValueError, match="Checksum mismatch: data is corrupt"):
        decode(tampered_encoded)

def test_truncated_payload():
    """Tests that decoding fails if the payload is truncated."""
    encoded = encode(b'some long data')
    # Truncate one character from the payload part
    tampered_encoded = encoded[:-1]
    with pytest.raises(ValueError, match="Checksum mismatch: data is corrupt"):
        decode(tampered_encoded)

def test_extra_valid_codepoints():
    """Tests that decoding fails if there are extra valid codepoints at the end."""
    encoded = encode(b'some data')
    # Add a valid character to the end
    tampered_encoded = encoded + ALPHABET[0]
    with pytest.raises(ValueError, match="Checksum mismatch: data is corrupt"):
        decode(tampered_encoded)

def test_extra_invalid_codepoints_are_ignored():
    """Tests that extra invalid codepoints at the end are ignored and decoding succeeds."""
    payload = b'some data'
    encoded = encode(payload)
    # Add an invalid character to the end
    tampered_encoded = encoded + '!'
    decoded = decode(tampered_encoded)
    assert decoded == payload
