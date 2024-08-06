import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";
import type { BaseEventHandler } from "@/events/eventEmitter.js";

const { FixitEventEmitter } = await vi.importActual<typeof import("@/events/eventEmitter.js")>(
  "@/events/eventEmitter.js"
);

export const eventEmitter = new FixitEventEmitter(
  Object.keys(FixitEventEmitter.EVENT_HANDLERS).reduce(
    (accum: Record<string, Array<BaseEventHandler>>, eventName) => {
      accum[eventName] = [
        (...args: unknown[]) => {
          logger.test(`Event emitted: "${eventName}"`);
          if (args.length > 0) {
            console.groupCollapsed(`Event "${eventName}": click to view args`); // eslint-disable-line no-console
            logger.test(safeJsonStringify(args));
            console.groupEnd(); // eslint-disable-line no-console
          }
          return Promise.resolve();
        },
      ];
      return accum;
    },
    {}
  ) as typeof FixitEventEmitter.EVENT_HANDLERS
);
