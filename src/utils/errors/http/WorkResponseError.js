class WorkResponseError extends Error {
  constructor(userMessage, request) {
    super(userMessage);

    this.userMessage = userMessage;
    this.request = request;
  }
}

module.exports = WorkResponseError;
