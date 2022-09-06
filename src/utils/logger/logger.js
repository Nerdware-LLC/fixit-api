import colors from "colors";
import { getLogFnFromTemplate } from "./loggerTemplate";

export const logger = {
  server: getLogFnFromTemplate("SERVER", { messageColor: colors.magenta }),
  security: getLogFnFromTemplate("SECURITY", {
    labelColor: colors.bgRed.black.bold,
    messageColor: colors.red.bold
  }),
  debug: getLogFnFromTemplate("DEBUG"),
  error: getLogFnFromTemplate("ERROR", { messageColor: colors.red }),
  auth: getLogFnFromTemplate("AUTH", { messageColor: colors.cyan }),
  gql: getLogFnFromTemplate("GQL", { messageColor: colors.magenta }),
  stripe: getLogFnFromTemplate("STRIPE", { messageColor: colors.green }),
  dynamodb: getLogFnFromTemplate("DynamoDB", { messageColor: colors.blue }),
  webhook: getLogFnFromTemplate("WEBHOOK", {
    messageColor: colors.green,
    loggerArgsPreProcessor: (eventActionability, eventType, eventObject) => ({
      // prettier-ignore
      message: `${eventActionability} type = ${eventType}, object = ${JSON.stringify(eventObject, null, 2)}`
    })
  })
};
