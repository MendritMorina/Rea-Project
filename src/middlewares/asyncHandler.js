// Middleware that is used to wrap all our express handlers to avoid excessive try/catch blocks.
const asyncHandler = (fn) => {
  return (request, response, next) => {
    fn(request, response, next).catch(next);
  };
};

// Exports of this file.
module.exports = asyncHandler;
