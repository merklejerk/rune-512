class RuneError(ValueError):
    """Base class for all rune-512 decoding errors."""
    pass

class InvalidPrefixError(RuneError):
    """Raised when the magic prefix is missing."""
    def __init__(self, message="Invalid magic prefix"):
        super().__init__(message)

class ShortPacketError(RuneError):
    """Raised when the packet is too short to contain a valid header or payload."""
    def __init__(self, message="Invalid packet: not enough data"):
        super().__init__(message)

class ChecksumMismatchError(RuneError):
    """Raised when the calculated checksum does not match the retrieved checksum."""
    def __init__(self, message="Checksum mismatch: data is corrupt"):
        super().__init__(message)
