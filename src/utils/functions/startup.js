// Imports: core node modules.
const fs = require('fs');
const path = require('path');

// Imports: local files.
const { Admin, SubscriptionType, NotificationType } = require('../../models');
const { subscriptions, notificationTypes } = require('../../configs');

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

// Function that is used to init the public folder.
const initPublicFolder = async () => {
  const pathToPublicFolder = path.join(__dirname, '../../../public');

  const publicFolderExists = fs.existsSync(pathToPublicFolder);
  if (!publicFolderExists) fs.mkdirSync(pathToPublicFolder);

  const childFolders = [
    'baserecommendations',
    'informativerecommendations',
    'recommendationcards',
    'advertisements',
    'companies',
    'stories',
  ];
  for (const childFolder of childFolders) {
    const pathToChildFolder = path.join(__dirname, `../../../public/${childFolder}`);

    const childFolderExists = fs.existsSync(pathToChildFolder);
    if (!childFolderExists) fs.mkdirSync(pathToChildFolder);
  }
};

// Function that is used to add initial notification types in our API.
const initNotificationTypes = async () => {
  for (const notificationType of notificationTypes) {
    const { name, showName } = notificationType;

    const typeExists = (await NotificationType.countDocuments({ name })) > 0;
    if (typeExists) continue;

    await NotificationType.create({ name, showName });
  }
};

// Function that is used to add initial subscription types in our API.
const addAppleSubscriptionTypes = async () => {
  for (const key in subscriptions) {
    const currentSubscription = subscriptions[key];

    const typeExists = (await SubscriptionType.countDocuments({ appleId: currentSubscription.appleId })) > 0;
    if (typeExists) continue;

    await SubscriptionType.create({ ...currentSubscription, platform: 'APPLE', createdBy: null });
  }
};

// Exports of this file.
module.exports = { initAdmins, initPublicFolder, initNotificationTypes, addAppleSubscriptionTypes };
