// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: local files.
const { Admin } = require('../../models');

// Function that is used to initalize admins located in a json file inside ./src/utils/data/admins.json.
const initAdmins = async () => {
  const pathToAdmins = path.join(__dirname, '../data/admins.json');
  const admins = JSON.parse(fs.readFileSync(pathToAdmins, { encoding: 'utf-8' }));

  for (const admin of admins) {
    const adminExists =
      (await Admin.countDocuments({
        email: admin.email,
        isDeleted: false,
      })) > 0;
    if (adminExists) continue;

    await Admin.create({ ...admin });
  }
};

// Exports of this file.
module.exports = { initAdmins };
