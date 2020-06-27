import { getConfig } from "../../../server/api/lib/config";
import { runningInLambda } from "../../../server/api/lib/utils";

import {
  getActionHandler,
  getActionChoiceData
} from "../../../integrations/action-handlers";

export const DEFAULT_NGP_VAN_INITIAL_TEXT_CANVASS_RESULT = "Texted";

export const serverAdministratorInstructions = () => {
  return {
    description: `
      Update the contact in VAN with a status of Texted
      when the initial message is sent to the contact
      for a campaign.
    `,
    setupInstructions: `
      This message handler is dependent on the ngpvan-action Action Handler.
      Follow its setup instructions.
    `,
    environmentVariables: []
  };
};

export const available = async organization => {
  const handler = await getActionHandler("ngpvan-action", organization);
  return !!handler;
};

// export const preMessageSave = async () => {};

export const postMessageSave = async ({ contact, organization }) => {
  if (contact.message_status !== "needsMessage") {
    // return {};
  }

  const handler = await getActionHandler("ngpvan-action", organization);
  const clientChoiceData = await getActionChoiceData(handler, organization);
  const initialTextResult =
    getConfig("NGP_VAN_INITIAL_TEXT_CANVASS_RESULT", organization) ||
    DEFAULT_NGP_VAN_INITIAL_TEXT_CANVASS_RESULT;

  const texted = clientChoiceData.find(ccd => ccd.name === initialTextResult);
  const body = JSON.parse(texted.details);

  const promise = handler
    .postCanvassResponse(contact, organization, body)
    .then(() => {})
    .catch(caughtError => {
      // eslint-disable-next-line no-console
      console.error(
        "Encountered exception in ngpvan.postMessageSave",
        caughtError
      );
      return {};
    });

  if (runningInLambda()) {
    return promise;
  }

  return {};
};
