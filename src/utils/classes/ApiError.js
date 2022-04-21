// Class that is used to represent errors in our API.
class ApiError extends Error {
  constructor(message, httpCode) {
    super(message);

    this.httpCode = httpCode;

    Error.captureStackTrace(this, ApiError);
  }
}

// Exports of this file.
module.exports = ApiError;
