// Imports: third-party packages.
const mongoose = require('mongoose');

// Imports: local files.
const env = require('./env');

// Function that is used to connect to the database.
const connect = async () => {
  return new Promise((resolve, reject) => {
    try {
      const { mongoHost, mongoPort, mongoName } = env.getByKeys(['mongoHost', 'mongoPort', 'mongoName']);
      const mongoUri = `mongodb://${mongoHost}:${mongoPort}/${mongoName}`;

      mongoose.connect(mongoUri, {}, (error) => {
        if (error) {
          const errorMessage = error.message || 'Failed to connect to the database!';
          resolve({ success: false, data: {}, error: errorMessage });
        } else {
          resolve({ success: true, data: {}, error: null });
        }
      });
    } catch (error) {
      const errorMessage = error.message || 'Failed to connect to the database!';
      resolve({ success: false, data: {}, error: errorMessage });
    }
  });
};

// Exports of this file.
module.exports = { connect };
