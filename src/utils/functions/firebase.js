// Imports: third-party packages.
const admin = require('firebase-admin');

// Imports: local files.
const serviceAccount = require('../../../serviceAccountKey.json');

// Function that is used to initialize firebase admin.
const initAdmin = () => {
  if (!admin.apps.length) return admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
};

// Exports of this file.
module.exports = { initAdmin };
