// import http from 'http'; TODO: fix this properly

class APIError extends Error {
  constructor(statusCode, message, errors) {
    const name = "Iva";
    super(`${statusCode} ${name}`);

    this.name = name;
    this.statusCode = statusCode;
    this.userMessage = message;
    this.errors = errors;
  }
}
module.exports = APIError;
