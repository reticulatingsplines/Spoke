/// All functions are OPTIONAL EXCEPT metadata() and const name=.
/// DO NOT IMPLEMENT ANYTHING YOU WILL NOT USE -- the existence of a function adds behavior/UI (sometimes costly)

import { r, cacheableData } from "../../../server/models";
import { getFeatures } from "../../../server/api/lib/config";

export const name = "twilio-number-multiplexing";

export async function getCode(phoneNumber) {
  const fullNumber = phoneNumber.toString();
  // numbers are in "+18885555555" format
  return fullNumber.slice(2, 5);
}

export const metadata = () => ({
  // set canSpendMoney=true, if this extension can lead to (additional) money being spent
  // if it can, which operations below can trigger money being spent?
  displayName: "Twilio Phone Number Multiplexing",
  description:
    "Used to allow a single Twilio service - and its number pool - to be shared among multiple orgs. The number used is determined by a org-level config setting which specifies which area code(s) to use.",
  canSpendMoney: false,
  moneySpendingOperations: ["onCampaignStart"],
  supportsOrgConfig: true,
  supportsCampaignConfig: false
});

export async function onMessageSend({
  message,
  contact,
  organization,
  campaign,
  serviceManagerData
}) {
  const orgAreaCodes =
    organization.features && organization.features.includes("areaCodes")
      ? JSON.parse(organization.features).areaCodes
      : [];

  console.log(
    "twilio-number-multiplexing.onMessageSend",
    message.id,
    message.user_number,
    serviceManagerData,
    orgAreaCodes
  );

  if (
    (message.user_number &&
      orgAreaCodes.includes(getCode(message.user_number))) ||
    (serviceManagerData &&
      serviceManagerData.user_number &&
      orgAreaCodes.includes(getCode(serviceManagerData.user_number)))
  ) {
    // The user_number associated with the outgoing message is already fine; don't mess with it
    // allows sticky numbers to keep working
    return;
  }
  const serviceName = cacheableData.organization.getMessageService(
    organization
  );
  const selectedPhone = await r
    .knex("owned_phone_number")
    .where({ service: serviceName })
    .whereIn("area_code", orgAreaCodes)
    .orderByRaw("random()")
    .select("phone_number")
    .first();

  console.log(
    "twilio-number-multiplexing.onMessageSend selectedPhone",
    selectedPhone
  );

  if (selectedPhone && selectedPhone.phone_number) {
    return { user_number: selectedPhone.phone_number };
  } else {
    console.log(
      "twilio-number-multiplexing.onMessageSend found no suitable number to send message with!",
      serviceName,
      organization.id,
      orgAreaCodes
    );
  }
}

// NOTE: this is somewhat expensive relatively what it usually is,
// so only implement this if it's important
/*
export async function onDeliveryReport({
  contactNumber,
  userNumber,
  messageSid,
  service,
  messageServiceSid,
  newStatus,
  errorCode,
  organization,
  campaignContact,
  lookup
}) {}
*/

// When a contact is opted out
/*
export async function onOptOut({
  organization,
  contact,
  campaign,
  user,
  noReply,
  reason,
  assignmentId
}) {}
*/

/*
export async function getCampaignData({
  organization,
  campaign,
  user,
  loaders,
  fromCampaignStatsPage
}) {
  // MUST NOT RETURN SECRETS!
  // called both from edit and stats contexts: editMode==true for edit page
  if (fromCampaignStatsPage) {
    return {
      data: {
        foo: "statsPage Info!!!"
      },
      unArchiveable: true
    };
  } else {
    return {
      data: {
        foo: "bar"
      },
      fullyConfigured: campaign.is_started
    };
  }
}
*/

/*
export async function onCampaignUpdateSignal({
  organization,
  campaign,
  user,
  updateData,
  fromCampaignStatsPage
}) {
  return {
    data: {
      foo: "xyz"
    },
    fullyConfigured: true,
    unArchiveable: false
  };
}
*/

/*
export async function onCampaignContactLoad({
  organization,
  campaign,
  ingestResult,
  ingestDataReference,
  finalContactCount,
  deleteOptOutCells
}) {
  console.log(
    "service-managers.test-fake-example.OnCampaignContactLoad 11",
    organization.id,
    campaign.id,
    ingestResult,
    ingestDataReference
  );
}
*/

export async function getOrganizationData({ organization }) {
  const orgAreaCodes =
    organization.features && organization.features.includes("areaCodes")
      ? JSON.parse(organization.features).areaCodes
      : [];
  return {
    // data is any JSON-able data that you want to send.
    // This can/should map to the return value if you implement onOrganizationUpdateSignal()
    // which will then get updated data in the Settings component on-save
    data: { areaCodes: orgAreaCodes },
    // fullyConfigured: null means (more) configuration is optional -- maybe not required to be enabled
    // fullyConfigured: true means it is fully enabled and configured for operation
    // fullyConfigured: false means more configuration is REQUIRED (i.e. manager is necessary and needs more configuration for Spoke campaigns to run)
    fullyConfigured: null
  };
}

/*
export async function onBuyPhoneNumbers({
  organization,
  user,
  serviceName,
  areaCode,
  limit,
  opts
}) {}

export async function onOrganizationServiceVendorSetup({
  organization,
  user,
  serviceName,
  oldConfig,
  newConfig
}) {}
*/

export async function onOrganizationUpdateSignal({
  organization,
  user,
  updateData
}) {
  const orgChanges = {
    features: getFeatures(organization)
  };
  const setAreaCodes = getFeatures(organization).areaCodes || [];
  console.log(
    "organization: %s\nuser: %s\nupdate data: %s\n:orgChanges: %s\nsetAreaCodes: %s",
    [organization, user, updateData, orgChanges, setAreaCodes]
  );

  return {
    data: updateData,
    fullyConfigured: true
  };
}

/*
export async function onCampaignStart({ organization, campaign, user }) {
  console.log(
    "service-managers.test-fake-example onCampaignStart",
    campaign.id,
    user.id
  );
}

export async function onCampaignArchive({}) {}

export async function onCampaignUnarchive({}) {
  // you can throw an error to block un-archiving
}
*/
