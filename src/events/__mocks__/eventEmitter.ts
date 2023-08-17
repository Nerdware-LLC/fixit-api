import { logger, safeJsonStringify } from "@utils";

const { FixitEventEmitter } = await vi.importActual<typeof import("@events/eventEmitter")>(
  "@events/eventEmitter"
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