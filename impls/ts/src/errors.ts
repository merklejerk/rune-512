export class RuneError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RuneError';
    }
}

export class ShortPacketError extends RuneError {
    constructor(message = 'Packet is too short') {
        super(message);
        this.name = 'ShortPacketError';
    }
}

export class ChecksumMismatchError extends RuneError {
    constructor(message = 'Checksum mismatch: data is corrupt') {
        super(message);
        this.name = 'ChecksumMismatchError';
    }
}

export class InvalidPaddingError extends RuneError {
    constructor(message = 'Invalid padding') {
        super(message);
        this.name = 'InvalidPaddingError';
    }
}
