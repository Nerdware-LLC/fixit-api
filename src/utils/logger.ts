import * as Sentry from "@sentry/node";
import chalk, { type ChalkInstance } from "chalk";
import moment from "moment";
import { ENV } from "@server/env";
import { safeJsonStringify } from "@utils/typeSafety";

/* eslint-disable no-console */

/**
 * Returns a log message string.
 * - Format: `"[<timestamp>][<label>] <messagePrefix?> <message>"`
 * - Timestamp format: `"YYYY:MMM:D k:mm:ss.SS"`
 */
const getLogMessage = ({
  label,
  input,
  messagePrefix,
  labelColor,
  messageColor,
}: GetLogMessageArgsProvidedByLoggerUtil & GetLogMessageArgsProvidedByHandler): string => {
  let labelAndTimestamp = `[${moment().format("YYYY:MMM:D k:mm:ss.SS")}][${label}]`;

  let message = messagePrefix ? `${messagePrefix} ` : "";
  message +=
    input instanceof Error
      ? input.message
      : typeof input === "string"
      ? input
      : safeJsonStringify(input);

  if (labelColor) labelAndTimestamp = labelColor(labelAndTimestamp);
  if (messageColor) message = messageColor(message);

  return `${labelAndTimestamp} ${message}`;
};

/**
 * This function returns a logging function suited for the operating environment:
 *
 * - IN PRODUCTION:
 *   - Error logs are always sent to Sentry
 *   - Non-error logs:
 *     - Sent to Sentry if `isEnabledInProduction` is `true`
 *     - Ignored if `isEnabledInProduction` is `false`
 *
 * - IN NON-PRODUCTION ENVS:
 *   - Error logs are always logged using `console.error`
 *   - Non-error logs are colorized and logged using `nonProdConsoleMethod`
 *
 * > Errors are always logged in all environments regardless of
 *   `isEnabledInProduction` which only applies to non-error logs.
 */
const getLoggerUtil = ({
  label,
  isEnabledInProduction = false,
  nonProdConsoleMethod = console.log,
  messageColor = chalk.white,
  labelColor = messageColor?.bold ?? messageColor,
}: GetLogMessageArgsProvidedByLoggerUtil & {
  /** Bool flag to enable logging non-errors in prod. */
  isEnabledInProduction?: boolean;
  /** The `console` method to use (default: `console.log`). */
  nonProdConsoleMethod?:
    | typeof console.log
    | typeof console.info
    | typeof console.debug
    | typeof console.warn
    | typeof console.error;
}): LoggerFn => {
  // `handleLogMessage` and `handleLogError` are env-dependent and govern where/how logs are sent
  const {
    handleLogMessage,
    handleLogError,
  }: Record<"handleLogMessage" | "handleLogError", LoggerFn> = ENV.IS_PROD
    ? {
        handleLogError: (input, messagePrefix) => {
          Sentry.captureException(input);
          Sentry.captureMessage(getLogMessage({ label, input, messagePrefix }));
        },
        handleLogMessage:
          isEnabledInProduction === true
            ? (input, messagePrefix) => {
                Sentry.captureMessage(getLogMessage({ label, input, messagePrefix }));
              }
            : () => {
                /* noop, function is disabled */
              },
      }
    : {
        handleLogError: (input, messagePrefix) => {
          console.error(getLogMessage({ label, input, messagePrefix }), input);
        },
        handleLogMessage: (input, messagePrefix) => {
          nonProdConsoleMethod(
            getLogMessage({ label, input, messagePrefix, labelColor, messageColor })
          );
        },
      };

  // The returned fn simply checks if input is an Error, and calls handleLogMessage/handleLogError accordingly
  return (input, messagePrefix) => {
    if (input instanceof Error) handleLogError(input, messagePrefix);
    else handleLogMessage(input, messagePrefix);
  };
};

export const logger = {
  server: getLoggerUtil({
    label: "SERVER",
    messageColor: chalk.magenta,
  }),
  warn: getLoggerUtil({
    label: "SERVER",
    messageColor: chalk.yellow,
  }),
  security: getLoggerUtil({
    label: "SECURITY",
    messageColor: chalk.red.bold,
    labelColor: chalk.bgRed.black.bold,
    isEnabledInProduction: true,
  }),
  debug: getLoggerUtil({
    label: "DEBUG",
    messageColor: chalk.cyan,
    nonProdConsoleMethod: console.debug,
  }),
  test: getLoggerUtil({
    label: "TEST",
    messageColor: chalk.bgCyan.black,
  }),
  error: getLoggerUtil({
    label: "ERROR",
    messageColor: chalk.red,
    isEnabledInProduction: true,
  }),
  gql: getLoggerUtil({
    label: "GQL",
    messageColor: chalk.magenta,
  }),
  stripe: getLoggerUtil({
    label: "STRIPE",
    messageColor: chalk.green,
  }),
  dynamodb: getLoggerUtil({
    label: "DynamoDB",
    messageColor: chalk.blue,
    isEnabledInProduction: true,
  }),
  webhook: getLoggerUtil({
    label: "WEBHOOK",
    messageColor: chalk.green,
    isEnabledInProduction: true,
  }),
};

/** Args provided to `getLogMessage` by `getLoggerUtil`. */
type GetLogMessageArgsProvidedByLoggerUtil = {
  /** A purpose-related label used to differentiate log sources. */
  label: string;
  /** A [chalk](https://www.npmjs.com/package/chalk) color for dev env log labels. */
  labelColor?: ChalkInstance;
  /** A [chalk](https://www.npmjs.com/package/chalk) color for dev env logs (default: white). */
  messageColor?: ChalkInstance;
};

/** Args provided to `getLogMessage` by `LoggerFn` invocations. */
type GetLogMessageArgsProvidedByHandler = {
  /** The raw input provided to a logger function. */
  input: unknown;
  /** An optional string to prefix the stringified log `input`. */
  messagePrefix?: string | undefined;
};

/** This type reflects the structure of the function returned by `getLoggerUtil`. */
type LoggerFn = (
  input: GetLogMessageArgsProvidedByHandler["input"],
  messagePrefix?: GetLogMessageArgsProvidedByHandler["messagePrefix"]
) => void;