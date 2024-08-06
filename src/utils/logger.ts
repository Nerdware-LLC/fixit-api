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

/* eslint-disable no-console */

const jsonStrSpaces = ENV.IS_PROD ? 0 : 2;

/**
 * Returns a log message string.
 * - Log message format: `"[<label>] <msgPrefix?> <message>"`
 */
const getLogMessage = ({
  label,
  input,
  msgPrefix,
  labelColor,
  msgColor,
}: GetLogMessageArgsProvidedByLoggerUtil & GetLogMessageArgsProvidedByHandler): string => {
  let formattedLabel = `[${label}]`;
  if (labelColor) formattedLabel = labelColor(formattedLabel);

  let formattedMsg = msgPrefix ? `${msgPrefix} ` : "";
  formattedMsg += getErrorMessage(input) || safeJsonStringify(input, null, jsonStrSpaces);
  if (msgColor) formattedMsg = msgColor(formattedMsg);

  return `${formattedLabel} ${formattedMsg}`;
};
/**
 * Returns a log message string with a timestamp.
 * - Log message format: `"[<timestamp>][<label>] <msgPrefix?> <message>"`
 * - Timestamp format: `"YYYY:MMM:D H:mm:ss.SSS"`
 */
const getLogMessageWithTimestamp = ({
  label,
  input,
  msgPrefix,
  labelColor,
  msgColor,
}: GetLogMessageArgsProvidedByLoggerUtil & GetLogMessageArgsProvidedByHandler): string => {
  let timestamp = `[${dayjs().format("YYYY:MMM:D H:mm:ss.SSS")}]`;
  if (labelColor) timestamp = labelColor(timestamp);

  return `${timestamp}${getLogMessage({ label, input, msgPrefix, labelColor, msgColor })}`;
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
        handleLogError: (error, msgPrefix) => {
          // If error has a `statusCode` and the `statusCode` is under 500, ignore it.
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (isSafeInteger(statusCode) && statusCode < 500) return;
          Sentry.captureException(error);
          // stderr goes to CloudWatch in deployed envs
          console.error(getLogMessage({ label, input: error, msgPrefix }));
        },
        handleLogMessage: isEnabledInDeployedEnvs
          ? (input, msgPrefix) => {
              Sentry.captureMessage(getLogMessageWithTimestamp({ label, input, msgPrefix }));
              // stdout goes to CloudWatch in deployed envs
              consoleMethod(getLogMessage({ label, input, msgPrefix }));
            }
          : () => {
              /* noop, function is disabled */
            },
      }
    : {
        handleLogError: (error, msgPrefix) => {
          console.error(
            getLogMessageWithTimestamp({ label, input: error, msgPrefix, labelColor, msgColor })
          );
        },
        handleLogMessage: (input, msgPrefix) => {
          consoleMethod(
            getLogMessageWithTimestamp({ label, input, msgPrefix, labelColor, msgColor })
          );
        },
      };

  // The returned fn simply checks if input is an Error, and calls handleLogMessage/handleLogError accordingly
  return (input, msgPrefix) => {
    if (isError(input)) handleLogError(input, msgPrefix);
    else handleLogMessage(input, msgPrefix);
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
    msgColor: chalk.cyan,
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
  labelColor?: ChalkInstance | undefined;
  /** A [chalk](https://www.npmjs.com/package/chalk) color for dev env logs (default: white). */
  msgColor?: ChalkInstance | undefined;
};

/** Args provided to `getLogMessage` by `LoggerFn` invocations. */
type GetLogMessageArgsProvidedByHandler = {
  /** The raw input provided to a logger function. */
  input: unknown;
  /** An optional string to prefix the stringified log `input`. */
  msgPrefix?: string | undefined;
};

/** This type reflects the structure of the function returned by `getLoggerUtil`. */
type LoggerFn = (
  input: GetLogMessageArgsProvidedByHandler["input"],
  msgPrefix?: GetLogMessageArgsProvidedByHandler["msgPrefix"]
) => void;

/** Internal type for `handleLogError` fns used in `getLoggerUtil`. */
type ErrorLoggerFn = (
  error: unknown,
  msgPrefix?: GetLogMessageArgsProvidedByHandler["msgPrefix"]
) => void;
