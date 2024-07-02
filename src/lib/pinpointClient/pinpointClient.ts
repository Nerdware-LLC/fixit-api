import {
  PinpointClient,
  SendMessagesCommand,
  type MessageRequest,
  type ChannelType,
  type TemplateConfiguration,
  type Template,
} from "@aws-sdk/client-pinpoint";
import { getErrorMessage } from "@nerdware/ts-type-safety-utils";
import { ENV } from "@/server/env";
import { logger } from "@/utils/logger.js";
import { fmtMessageAddresses, type PinpointMessageTo } from "./helpers.js";
import type { OverrideProperties } from "type-fest";

const _pinpointClient = new PinpointClient({ region: ENV.AWS.REGION });

/**
 * App-specific Pinpoint templates.
 */
export const APP_TEMPLATES = {
  EMAIL: {
    WELCOME: {
      Name: "new-user-welcome-email",
    },
    CHECKOUT_CONFIRMATION: {
      Name: "checkout-confirmation-email",
    },
    PASSWORD_RESET: {
      Name: "password-reset-email",
    },
    INVITE: {
      Name: "fixit-user-invitation-email",
    },
  },
  SMS: {
    INVITE: {
      Name: "fixit-user-invitation-sms",
    },
  },
} as const satisfies { [Ch in ChannelType]?: Record<string, Template> };

type AppTemplatesDict = typeof APP_TEMPLATES;
type AppTemplatesChannelType = keyof AppTemplatesDict;
type EmailTemplateName = AppTemplatesDict["EMAIL"][keyof AppTemplatesDict["EMAIL"]]["Name"];
type SMSTemplateName = AppTemplatesDict["SMS"][keyof AppTemplatesDict["SMS"]]["Name"];

/**
 * Mapping of supported Pinpoint channel-types to the corresponding template configuration key.
 */
type ChannelTypeToTemplateConfigKey = {
  EMAIL: "EmailTemplate";
  SMS: "SMSTemplate";
};

/**
 * Parameter typing for {@link pinpointClient.sendMessages}.
 */
type SendAppMessagesParams<Ch extends AppTemplatesChannelType | undefined> = PinpointMessageTo<Ch> &
  (Ch extends AppTemplatesChannelType
    ? OverrideProperties<
        MessageRequest,
        {
          TemplateConfiguration: {
            [TemplateConfigKey in keyof TemplateConfiguration as TemplateConfigKey extends ChannelTypeToTemplateConfigKey[Ch]
              ? TemplateConfigKey
              : never]?: Ch extends "EMAIL"
              ? { Name: EmailTemplateName; Version?: string }
              : Ch extends "SMS"
                ? { Name: SMSTemplateName; Version?: string }
                : never;
          };
        }
      >
    : never);

/**
 * Amazon Pinpoint client with wrapper methods for simplified messaging.
 */
export const pinpointClient = {
  /**
   * Thin wrapper around {@link SendMessagesCommand}
   * - Creates a new `SendMessagesCommand` instance with the app's Pinpoint project ID on every call.
   * - Narrows {@link Template} params to only permit the app's existing Pinpoint message templates.
   *
   *   > **Note:** If a template `Version` is not provided, it defaults to the template's `"Active"` version.
   *   >
   *   > See [AWS Docs: Designating the Active version of a message template][template-version-docs].
   *
   * [template-version-docs]: https://docs.aws.amazon.com/pinpoint/latest/userguide/message-templates-versioning.html#message-templates-versioning-set-active
   */
  sendMessages: async <Ch extends AppTemplatesChannelType | undefined>({
    to,
    ChannelType,
    ...messageRequest
  }: SendAppMessagesParams<Ch>) => {
    return await _pinpointClient
      .send(
        new SendMessagesCommand({
          ApplicationId: ENV.AWS.PINPOINT_PROJECT_ID,
          MessageRequest: {
            ...(!!to && !!ChannelType && { Addresses: fmtMessageAddresses({ to, ChannelType }) }),
            ...messageRequest,
          } as MessageRequest,
        })
      )
      .catch((error: unknown) => {
        const errMsg = getErrorMessage(error) ?? "(Unknown error)";
        /* Currently, the Pinpoint client is not provided with adequate permissions
        to send messages in the dev environment. Logging `errMsg` is therefore
        conditional in order to avoid cluttering the console with expected errors. */
        if (
          ENV.IS_DEPLOYED_ENV ||
          errMsg !== "The security token included in the request is invalid."
        ) {
          logger.error(`Error sending Pinpoint message: ${errMsg}`);
        }
      });
  },
} as const;
