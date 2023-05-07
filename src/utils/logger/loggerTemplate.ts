import * as Sentry from "@sentry/node";
import colors, { type Color } from "colors";
import moment from "moment";
import { ENV } from "@server/env";

export const getLogFnFromTemplate = <Opts extends GetLogFnFromTemplateOpts>(
  label: string,
  opts?: Opts
): Opts extends { loggerArgsPreProcessor: Function }
  ? (...args: any[]) => void
  : DefaultLoggerTemplateFn => {
  const messageColor = opts?.messageColor ?? colors.white;
  const labelColor = opts?.labelColor ?? messageColor?.bold ?? messageColor;

  const { messageLogFn, errorReportFn, errorLogFn } = ENV.IS_PROD
    ? {
        messageLogFn: (labelTxt: string, messageTxt: string) => {
          Sentry.captureMessage(`${labelTxt} ${messageTxt}`);
        },
        errorReportFn: Sentry.captureException,
        errorLogFn: Sentry.captureMessage,
      }
    : {
        messageLogFn: (labelTxt: string, messageTxt: string) => {
          console.log(`${labelColor(labelTxt)} ${messageColor(messageTxt)}`);
        },
        errorReportFn: console.error,
        errorLogFn: console.error,
      };

  const loggerTemplate: DefaultLoggerTemplateFn = (message: unknown, identifier?: string): void => {
    const timestamp = moment().format("YYYY:MMM:D k:mm:ss.SS");
    const labelTxt = `[${timestamp}][${label}]: ${identifier ? `${identifier} = ` : ""}`;
    if (message instanceof Error) {
      errorReportFn(message);
      errorLogFn(`${labelTxt} ${message}`);
    } else {
      const messageTxt = typeof message === "string" ? message : JSON.stringify(message, null, 2);
      messageLogFn(labelTxt, messageTxt);
    }
  };

  return typeof opts?.loggerArgsPreProcessor === "function"
    ? (...args: any[]) => {
        // TS inference not catching that `loggerArgsPreProcessor` cannot be undefined here, hence the type cast
        // prettier-ignore
        const { message, identifier } = (opts.loggerArgsPreProcessor as NonNullable<GetLogFnFromTemplateOpts["loggerArgsPreProcessor"]>)(...args);
        loggerTemplate(message, identifier);
      }
    : loggerTemplate;
};

type DefaultLoggerTemplateFn = (message: unknown, identifier?: string) => void;

interface GetLogFnFromTemplateOpts {
  messageColor?: Color;
  labelColor?: Color;
  loggerArgsPreProcessor?: (...args: any[]) => {
    message: string | Error | { [K: string]: any };
    identifier?: string;
  };
}
