import * as Sentry from "@sentry/node";
import colors from "colors";
import moment from "moment";
import { ENV } from "@server/env";

export const getLogFnFromTemplate = (label, opts) => {
  const { messageColor, dynamicColorFn, loggerArgsPreProcessor } = opts ?? DEFAULT_OPTS;
  const labelColor = opts?.labelColor ?? messageColor?.bold ?? messageColor;

  const { messageLogFn, errorReportFn, errorLogFn } = ENV.IS_PROD
    ? {
        messageLogFn: (labelTxt, messageTxt) => Sentry.captureMessage(`${labelTxt} ${messageTxt}`),
        errorReportFn: Sentry.captureException,
        errorLogFn: Sentry.captureMessage
      }
    : {
        messageLogFn: dynamicColorFn
          ? (labelTxt, messageTxt, identifier) => {
              let { dynamicMessageColor = colors.white, dynamicLabelColor } = dynamicColorFn({
                labelTxt,
                messageTxt,
                identifier
              });
              if (!dynamicLabelColor) {
                dynamicLabelColor = dynamicMessageColor?.bold ?? dynamicMessageColor;
              }
              console.log(`${dynamicLabelColor(labelTxt)} ${dynamicMessageColor(messageTxt)}`);
            }
          : (labelTxt, messageTxt) => {
              console.log(`${labelColor(labelTxt)} ${messageColor(messageTxt)}`);
            },
        errorReportFn: console.error,
        errorLogFn: console.error
      };

  const loggerTemplate = (message, identifier) => {
    const timestamp = moment().format("YYYY:MMM:D k:mm:ss.SS");
    const labelTxt = `[${timestamp}][${label}]: ${identifier ? `${identifier} = ` : ""}`;
    if (message instanceof Error) {
      errorReportFn(message);
      errorLogFn(`${labelTxt} ${message}`);
    } else {
      const messageTxt = typeof message === "string" ? message : JSON.stringify(message, null, 2);
      messageLogFn(labelTxt, messageTxt, identifier);
    }
  };

  return loggerArgsPreProcessor
    ? (...args) => {
        const { message, identifier } = loggerArgsPreProcessor(...args);
        loggerTemplate(message, identifier);
      }
    : loggerTemplate;
};

const DEFAULT_OPTS = {
  messageColor: colors.white,
  dynamicColorFn: null,
  loggerArgsPreProcessor: null
};