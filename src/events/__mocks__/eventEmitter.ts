import { safeJsonStringify } from "@nerdware/ts-type-safety-utils";
import { logger } from "@/utils/logger.js";

const { FixitEventEmitter } = await vi.importActual<typeof import("@/events/eventEmitter.js")>(
  "@/events/eventEmitter.js"
);

export const eventEmitter = new FixitEventEmitter(
  Object.fromEntries(
    Object.keys(FixitEventEmitter.EVENT_HANDLERS).map((eventName) => [
      eventName,
      [
        (...args: unknown[]) => {
          logger.test(`Event emitted: "${eventName}"`);
          if (args.length > 0) {
            console.groupCollapsed(`Event "${eventName}": click to view args`); // eslint-disable-line no-console
            logger.test(safeJsonStringify(args));
            console.groupEnd(); // eslint-disable-line no-console
          }
        },
      ],
    ])
  ) as unknown as typeof FixitEventEmitter.EVENT_HANDLERS
);
