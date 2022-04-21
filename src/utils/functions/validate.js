// Imports: third-party packages.
const { validate } = require('express-validation');

// Function that is used to pass options to express-validation's validate, to avoid constant prop passing.
const validateSchema = (schema) => {
  return validate(schema, { context: true, keyByField: true }, { abortEarly: false });
};

// Exports of this file.
module.exports = validateSchema;
