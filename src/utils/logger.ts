import { safeJsonStringify, getErrorMessage, isError } from "@nerdware/ts-type-safety-utils";
import * as Sentry from "@sentry/node";
import chalk, { type ChalkInstance } from "chalk";
import dayjs from "dayjs";
import { ENV } from "@/server/env";

/* eslint-disable no-console */

/**
 * In deployed environments — production and staging — timestamps are formatted
 * to always be the same length to accomodate bulk log parsing.
 *
 *   > _example:_ `"2020:Jan:01 01:01:01.123"`
 *
 * In non-deployed environments, the timestamp format is designed to be easier
 * to read at a glance in the console.
 *
 *   > _example:_ `"2020:Jan:1 1:01:01.123"`
 */
const LOG_TIMESTAMP_FORMAT = ENV.IS_DEPLOYED_ENV
  ? "YYYY:MMM:DD HH:mm:ss.SSS"
  : "YYYY:MMM:D H:mm:ss.SSS";

/**
 * Returns a log message string.
 * - Format: `"[<timestamp>][<label>] <messagePrefix?> <message>"`
 * @see {@link LOG_TIMESTAMP_FORMAT}
 */
const getLogMessage = ({
  label,
  input,
  messagePrefix,
  labelColor,
  messageColor,
}: GetLogMessageArgsProvidedByLoggerUtil & GetLogMessageArgsProvidedByHandler): string => {
  let labelAndTimestamp = `[${dayjs().format(LOG_TIMESTAMP_FORMAT)}][${label}]`;

  let message = messagePrefix ? `${messagePrefix} ` : "";

  message += getErrorMessage(input) || safeJsonStringify(input);

  if (labelColor) labelAndTimestamp = labelColor(labelAndTimestamp);
  if (messageColor) message = messageColor(message);

  return `${labelAndTimestamp} ${message}`;
};

/**
 * This function returns a logging function suited for the operating environment:
 *
 * - IN DEPLOYED ENVS (PRODUCTION/STAGING):
 *   - Error logs are always sent to Sentry
 *   - Non-error logs:
 *     - Sent to Sentry if `isEnabledInProduction` is `true`
 *     - Ignored if `isEnabledInProduction` is `false`
 *
 * - IN NON-DEPLOYED ENVS:
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
  labelColor = messageColor.bold,
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
  }: Record<"handleLogMessage" | "handleLogError", LoggerFn> = ENV.IS_DEPLOYED_ENV
    ? {
        handleLogError: (input, messagePrefix) => {
          Sentry.captureException(input);
          Sentry.captureMessage(getLogMessage({ label, input, messagePrefix }));
        },
        handleLogMessage: isEnabledInProduction
          ? (input, messagePrefix) => {
              Sentry.captureMessage(getLogMessage({ label, input, messagePrefix }));
            }
          : () => {
              /* noop, function is disabled */
            },
      }
    : {
        handleLogError: (input, messagePrefix) => {
          console.error(getLogMessage({ label, input, messagePrefix, labelColor, messageColor }));
        },
        handleLogMessage: (input, messagePrefix) => {
          nonProdConsoleMethod(
            getLogMessage({ label, input, messagePrefix, labelColor, messageColor })
          );
        },
      };

  // The returned fn simply checks if input is an Error, and calls handleLogMessage/handleLogError accordingly
  return (input, messagePrefix) => {
    if (isError(input)) handleLogError(input, messagePrefix);
    else handleLogMessage(input, messagePrefix);
  };
};

export const logger = {
  server: getLoggerUtil({
    label: "SERVER",
    messageColor: chalk.magenta,
  }),
  warn: getLoggerUtil({
    label: "WARN",
    messageColor: chalk.yellow,
  }),
  security: getLoggerUtil({
    label: "SECURITY",
    messageColor: chalk.red.bold,
    labelColor: chalk.bgRed.black.bold,
    isEnabledInProduction: true,
  }),
  info: getLoggerUtil({
    label: "INFO",
    messageColor: chalk.cyan,
    nonProdConsoleMethod: console.info,
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
