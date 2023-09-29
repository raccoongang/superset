const { NotImplementedError } = require('lib').errors;

class BasePdfView {
  constructor(location, session) {
    this.location = location;
    this.session = session;
  }

  get renderedURL() {
    throw new NotImplementedError(
      'renderedURL functionality is not implemented yet.',
    );
  }

  async generate() {
    throw new NotImplementedError(
      'generate functionality is not implemented yet.',
    );
  }
}

module.exports = {
  BasePdfView: BasePdfView,
};
