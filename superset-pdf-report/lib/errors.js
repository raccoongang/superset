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
PDFGenerationError.prototype.name = 'PDFGenerationError';
TriedOptionsAndFailed.prototype.name = 'TriedOptionsAndFailed';

module.exports = {
    NotImplementedError: NotImplementedError,
    TriedOptionsAndFailed: TriedOptionsAndFailed,
    PDFGenerationError: PDFGenerationError,
};
