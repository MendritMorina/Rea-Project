// Imports: third-party packages.
const mailchimp = require('@mailchimp/mailchimp_marketing');

// Imports: local files.
const env = require('./env');
const { httpCodes } = require('../../configs');

// Configure mailchimp.
const { mailchimpApiKey, mailchimpServerPrefix } = env.getByKeys(['mailchimpApiKey', 'mailchimpServerPrefix']);

mailchimp.setConfig({ apiKey: mailchimpApiKey, server: mailchimpServerPrefix });

const healthcheck = async () => {
  try {
    const response = await mailchimp.ping.get();
    return { success: true, data: { message: response.health_status }, error: null, code: null };
  } catch (error) {
    const errorMessage = error.message || 'Internal Server Error!';
    return { success: false, data: {}, error: errorMessage, code: httpCodes.INTERNAL_ERROR };
  }
};

const createAudience = async (audienceName) => {
  try {
    const audienceResult = await getAudience(audienceName);
    if (audienceResult.success && audienceResult.data) {
      const { audience } = audienceResult.data;
      return { success: true, data: { audienceId: audience.id }, error: null, code: null };
    }

    const footerContactInfo = {
      company: 'Rea Shpk',
      address1: 'Rruga Ismail Qemali',
      address2: 'Suite 5000',
      city: 'Prishtina',
      state: 'Kosova',
      zip: '10000',
      country: 'Kosova',
    };

    const campaignDefaults = {
      from_name: 'Rea Shpk',
      from_email: 'reacompanyshpk@gmail.com',
      subject: 'Rea App',
      language: 'EN_US',
    };

    const response = await mailchimp.lists.createList({
      name: audienceName,
      contact: footerContactInfo,
      permission_reminder: 'permission_reminder',
      email_type_option: true,
      campaign_defaults: campaignDefaults,
    });

    return { success: true, data: { audienceId: response.id }, error: null, code: null };
  } catch (error) {
    const errorMessage = error.message || 'Internal Server Error!';
    return { success: false, data: {}, error: errorMessage, code: httpCodes.INTERNAL_ERROR };
  }
};

const createContact = async (user, audienceName) => {
  try {
    const audienceResult = await getAudience(audienceName);
    if (!audienceResult.success)
      return { success: false, data: {}, error: audienceResult.error, code: audienceResult.code };

    const { audience } = audienceResult.data;

    const response = await mailchimp.lists.addListMember(audience.id, {
      email_address: user.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: user.firstName,
        LNAME: user.lastName,
      },
    });

    return { success: true, data: { contactId: response.id }, error: null, code: null };
  } catch (error) {
    const errorMessage = error.message || 'Internal Server Error!';
    return { success: false, data: {}, error: errorMessage, code: httpCodes.INTERNAL_ERROR };
  }
};

const getAudience = async (audienceName) => {
  try {
    const response = await mailchimp.lists.getAllLists({ count: 1000 });
    const audiences = response.lists;

    let targetAudience = audiences.find((audience) => audience.name === audienceName);
    if (!targetAudience)
      return { success: false, data: {}, error: 'Target audience not found!', code: httpCodes.NOT_FOUND };

    return { success: true, data: { audience: targetAudience }, error: null, code: null };
  } catch (error) {
    const errorMessage = error.message || 'Internal Server Error!';
    return { success: false, data: {}, error: errorMessage, code: httpCodes.INTERNAL_ERROR };
  }
};

const removeAudiences = async () => {
  try {
    const response = await mailchimp.lists.getAllLists({ count: 1000 });
    const audiences = response.lists;

    for (const audience of audiences) await mailchimp.lists.deleteList(audience.id);

    return { success: true, data: { deleted: true }, error: null, code: null };
  } catch (error) {
    const errorMessage = error.message || 'Internal Server Error!';
    return { success: false, data: {}, error: errorMessage, code: httpCodes.INTERNAL_ERROR };
  }
};

const getInitialAudiences = () => {
  const production = 'Rea Audience';
  const development = 'Rea Audience - Development';

  return { production, development, arr: [production, development] };
};

// Exports of this file.
module.exports = { healthcheck, createAudience, createContact, removeAudiences, getInitialAudiences };
