export type RuneErrorCode =
    | 'EMPTY_STRING'
    | 'INVALID_PREFIX'
    | 'SHORT_PACKET'
    | 'INVALID_PADDING'
    | 'CHECKSUM_MISMATCH';

export class RuneError extends Error {
    code: RuneErrorCode;

    private static readonly messageMap: Record<RuneErrorCode, string> = {
        'EMPTY_STRING': "Invalid packet: empty string",
        'INVALID_PREFIX': "Invalid magic prefix",
        'SHORT_PACKET': "Invalid packet: not enough data for header",
        'INVALID_PADDING': "Invalid padding",
        'CHECKSUM_MISMATCH': "Checksum mismatch: data is corrupt"
    };

    constructor(code: RuneErrorCode) {
        super();
        this.name = 'RuneError';
        this.code = code;
    }

    get message(): string {
        return RuneError.messageMap[this.code];
    }
}
