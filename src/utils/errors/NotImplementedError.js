class NotImplementedError extends Error {
  constructor(message) {
    super(`${message}`);
  }
}
module.exports = NotImplementedError;
