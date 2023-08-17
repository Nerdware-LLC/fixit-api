import { EventEmitter } from "events";
import { notifyAssigneeNewInvoice } from "@/events/onInvoiceCreated";
import { notifyAssigneeDeletedInvoice } from "@/events/onInvoiceDeleted";
import { notifyAssignorPaidInvoice } from "@/events/onInvoicePaid";
import { notifyAssigneeUpdatedInvoice } from "@/events/onInvoiceUpdated";
import { sendWelcomeEmail } from "@/events/onNewUser";
import { notifyAssigneeCancelledWO } from "@/events/onWorkOrderCancelled";
import { notifyAssignorCompletedWO } from "@/events/onWorkOrderCompleted";
import { notifyAssigneeNewWO } from "@/events/onWorkOrderCreated";
import { notifyAssigneeUpdatedWO } from "@/events/onWorkOrderUpdated";
import { logger } from "@utils/logger";

/**
 * FixitEventEmitter is a simple wrapper around EventEmitter which
 * allows events to be called as methods on `eventEmitter`, rather
 * than as string enums passed to the `emit` method.
 * For each registered event, it creates an emit method and attaches
 * all event listeners in order.
 *
 * Note: An array of all events for which there are listeners can be
 * obtained via `process.eventNames`.
 */
  static readonly EVENT_HANDLERS = {
    InvoiceCreated: [notifyAssigneeNewInvoice],
    InvoiceUpdated: [notifyAssigneeUpdatedInvoice],
    InvoiceDeleted: [notifyAssigneeDeletedInvoice],
    InvoicePaid: [notifyAssignorPaidInvoice],
    NewUser: [sendWelcomeEmail],
    WorkOrderCreated: [notifyAssigneeNewWO],
    WorkOrderUpdated: [notifyAssigneeUpdatedWO],
    WorkOrderCancelled: [notifyAssigneeCancelledWO],
    WorkOrderCompleted: [notifyAssignorCompletedWO],
  } as const;

  constructor() {
    super();
    Object.entries(FixitEventEmitter.FIXIT_EVENT_HANDLERS).forEach(([eventName, eventHandlers]) => {
      // Provide an emit fn for the event
      Object.defineProperty(this, `emit${eventName}`, {
        value: (...args: any[]) => {
          this.emit(eventName, ...args);
        },
        writable: false,
        enumerable: false,
        configurable: false,
      });

      // Register the event's handler fns
      eventHandlers.forEach((eventHandler) =>
        this.on(
          eventName,
          !/^test/i.test(ENV.NODE_ENV)
            ? eventHandler
            : () => logger.test(`(Mock FixitEventEmitter) Event emitted: ${eventName}`)
        )
      );
    });
  }
}

/**
 * Fixit eventEmitter
 *
 * @method `emitInvoiceCreated()` args: (newInvoice)
 * @method `emitInvoiceUpdated()` args: (updatedInvoice)
 * @method `emitInvoiceDeleted()` args: (deletedInvoice)
 * @method `emitNewUser()` args: (newUser)
 * @method `emitWorkOrderCreated()` args: (newWorkOrder)
 * @method `emitWorkOrderUpdated()` args: (newWorkOrder, oldWorkOrder)
 * @method `emitWorkOrderCancelled()` args: (cancelledWorkOrder)
 * @method `emitWorkOrderCompleted()` args: (completedWorkOrder)
 */
export const eventEmitter = new FixitEventEmitter();

// To provide the methods in intellisense:
declare interface FixitEventEmitter {
  emitInvoiceCreated: (...args: Parameters<typeof notifyAssigneeNewInvoice>) => void;
  emitInvoiceUpdated: (...args: Parameters<typeof notifyAssigneeUpdatedInvoice>) => void;
  emitInvoiceDeleted: (...args: Parameters<typeof notifyAssigneeDeletedInvoice>) => void;
  emitInvoicePaid: (...args: Parameters<typeof notifyAssignorPaidInvoice>) => void;
  emitNewUser: () => void;
  emitWorkOrderCreated: (...args: Parameters<typeof notifyAssigneeNewWO>) => void;
  emitWorkOrderUpdated: (...args: Parameters<typeof notifyAssigneeUpdatedWO>) => void;
  emitWorkOrderCancelled: (...args: Parameters<typeof notifyAssigneeCancelledWO>) => void;
  emitWorkOrderCompleted: (...args: Parameters<typeof notifyAssignorCompletedWO>) => void;
}
