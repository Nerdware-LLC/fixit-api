import {
  safeJsonStringify,
  getErrorMessage,
  isError,
  isSafeInteger,
} from "@nerdware/ts-type-safety-utils";
import * as Sentry from "@sentry/node";
import chalk, { type ChalkInstance } from "chalk";
import dayjs from "dayjs";
import { ENV } from "@/server/env";
import type { HttpErrorInterface } from "./httpErrors";

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
  msgColor,
}: GetLogMessageArgsProvidedByLoggerUtil & GetLogMessageArgsProvidedByHandler): string => {
  let labelAndTimestamp = `[${dayjs().format(LOG_TIMESTAMP_FORMAT)}][${label}]`;

  let message = messagePrefix ? `${messagePrefix} ` : "";

  message += getErrorMessage(input) || safeJsonStringify(input);

  if (labelColor) labelAndTimestamp = labelColor(labelAndTimestamp);
  if (msgColor) message = msgColor(message);

  return `${labelAndTimestamp} ${message}`;
};

/**
 * This function returns a logging function suited for the operating environment:
 *
 * - IN DEPLOYED ENVS (PRODUCTION/STAGING):
 *   - Error logs are always sent to CloudWatch and Sentry
 *   - Non-error logs:
 *     - Sent to CloudWatch and Sentry if `isEnabledInDeployedEnvs` is `true`
 *     - Ignored if `isEnabledInDeployedEnvs` is `false`
 *
 * - IN NON-DEPLOYED ENVS:
 *   - Error logs are always logged using `console.error`
 *   - Non-error logs are colorized and logged using `consoleMethod`
 *
 * > Errors are always logged in all environments regardless of
 *   `isEnabledInDeployedEnvs` which only applies to non-error logs.
 */
const getLoggerUtil = ({
  label,
  isEnabledInDeployedEnvs = false,
  consoleMethod = console.log,
  msgColor = chalk.white,
  labelColor = msgColor.bold,
}: GetLogMessageArgsProvidedByLoggerUtil & {
  /** Bool flag to enable logging non-errors in deployed envs: staging, prod */
  isEnabledInDeployedEnvs?: boolean;
  /** The `console` method to use (default: `console.log`). */
  consoleMethod?:
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
  }: { handleLogError: ErrorLoggerFn; handleLogMessage: LoggerFn } = ENV.IS_DEPLOYED_ENV
    ? {
        handleLogError: (error, messagePrefix) => {
          // If error has a `statusCode` and the `statusCode` is under 500, ignore it.
          if (isSafeInteger(error?.statusCode) && error.statusCode < 500) return;
          Sentry.captureException(error);
          // stderr goes to CloudWatch in deployed envs
          console.error(getLogMessage({ label, input: error, messagePrefix }));
        },
        handleLogMessage: isEnabledInDeployedEnvs
          ? (input, messagePrefix) => {
              Sentry.captureMessage(getLogMessage({ label, input, messagePrefix }));
              // stdout goes to CloudWatch in deployed envs
              consoleMethod(getLogMessage({ label, input, messagePrefix }));
            }
          : () => {
              /* noop, function is disabled */
            },
      }
    : {
        handleLogError: (error, messagePrefix) => {
          console.error(
            getLogMessage({ label, input: error, messagePrefix, labelColor, msgColor })
          );
        },
        handleLogMessage: (input, messagePrefix) => {
          consoleMethod(getLogMessage({ label, input, messagePrefix, labelColor, msgColor }));
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
    msgColor: chalk.magenta,
  }),
  warn: getLoggerUtil({
    label: "WARN",
    msgColor: chalk.yellow,
  }),
  security: getLoggerUtil({
    label: "SECURITY",
    msgColor: chalk.red.bold,
    labelColor: chalk.bgRed.black.bold,
    isEnabledInDeployedEnvs: true,
  }),
  info: getLoggerUtil({
    label: "INFO",
    msgColor: chalk.cyan,
    consoleMethod: console.info,
  }),
  debug: getLoggerUtil({
    label: "DEBUG",
    msgColor: chalk.cyan,
    consoleMethod: console.debug,
  }),
  test: getLoggerUtil({
    label: "TEST",
    msgColor: chalk.bgCyan.black,
  }),
  error: getLoggerUtil({
    label: "ERROR",
    msgColor: chalk.red,
    isEnabledInDeployedEnvs: true,
  }),
  gql: getLoggerUtil({
    label: "GQL",
    msgColor: chalk.magenta,
  }),
  stripe: getLoggerUtil({
    label: "STRIPE",
    msgColor: chalk.green,
  }),
  dynamodb: getLoggerUtil({
    label: "DynamoDB",
    msgColor: chalk.blue,
    isEnabledInDeployedEnvs: true,
  }),
  webhook: getLoggerUtil({
    label: "WEBHOOK",
    msgColor: chalk.green,
    isEnabledInDeployedEnvs: true,
  }),
};

/** Args provided to `getLogMessage` by `getLoggerUtil`. */
type GetLogMessageArgsProvidedByLoggerUtil = {
  /** A purpose-related label used to differentiate log sources. */
  label: string;
  /** A [chalk](https://www.npmjs.com/package/chalk) color for dev env log labels. */
  labelColor?: ChalkInstance;
  /** A [chalk](https://www.npmjs.com/package/chalk) color for dev env logs (default: white). */
  msgColor?: ChalkInstance;
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

/** Internal type for `handleLogError` fns used in `getLoggerUtil`. */
type ErrorLoggerFn = (
  error: Error & Partial<HttpErrorInterface>,
  messagePrefix?: GetLogMessageArgsProvidedByHandler["messagePrefix"]
) => void;
