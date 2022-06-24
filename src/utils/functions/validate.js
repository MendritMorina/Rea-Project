// Third-party package imports.
const { validate } = require('express-validation');

/**
 * @description Wrapper function around express validation's own validate with config options passed automatically.
 */
function validateSchema(schema, options = {}) {
  let expressOptions = { context: true, keyByField: true };
  let joiOptions = { abortEarly: false };
  if (options.expressOptions && Object.keys(options.expressOptions).length) expressOptions = options.expressOptions;
  if (options.joiOptions && Object.keys(options.joiOptions).length) joiOptions = options.joiOptions;

  return validate(schema, expressOptions, joiOptions);
}
// Exports of this file.
module.exports = validateSchema;
