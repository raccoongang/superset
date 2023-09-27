class NotImplementedError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

class TriedOptionsAndFailed extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

class PDFGenerationError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}

NotImplementedError.prototype.name = 'NotImplementedError';
TriedOptionsAndFailed.name = 'TriedOptionsAndFailed';

module.exports = {
    NotImplementedError: NotImplementedError,
    TriedOptionsAndFailed: TriedOptionsAndFailed,
    PDFGenerationError: PDFGenerationError,
};
