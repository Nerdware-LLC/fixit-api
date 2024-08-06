import { EventEmitter } from "events";
import { sendConfirmationEmail } from "@/events/onCheckoutCompleted";
import { notifyAssigneeNewInvoice } from "@/events/onInvoiceCreated";
import { notifyAssigneeDeletedInvoice } from "@/events/onInvoiceDeleted";
import { notifyAssignorPaidInvoice } from "@/events/onInvoicePaid";
import { notifyAssigneeUpdatedInvoice } from "@/events/onInvoiceUpdated";
import { sendWelcomeEmail } from "@/events/onNewUser";
import { notifyAssigneeCancelledWO } from "@/events/onWorkOrderCancelled";
import { notifyAssignorCompletedWO } from "@/events/onWorkOrderCompleted";
import { notifyAssigneeNewWO } from "@/events/onWorkOrderCreated";
import { notifyAssigneeUpdatedWO } from "@/events/onWorkOrderUpdated";
import { logger } from "@/utils/logger.js";

/**
 * A thin wrapper around EventEmitter which adds named emitter methods for each
 * event for which listeners are registered. All event handlers are wrapped in
 * an async try/catch block to prevent unhandled errors/rejections.
 *
 * Note: If needed for debugging, an array of all events for which there are
 * listeners can be obtained via `process.eventNames`.
 */
export class FixitEventEmitter
  extends EventEmitter
  implements Record<`emit${FixitEventName}`, (...args: any[]) => void>
{
  static readonly EVENT_HANDLERS = {
    CheckoutCompleted: [sendConfirmationEmail],
    InvoiceCreated: [notifyAssigneeNewInvoice],
    InvoiceUpdated: [notifyAssigneeUpdatedInvoice],
    InvoiceDeleted: [notifyAssigneeDeletedInvoice],
    InvoicePaid: [notifyAssignorPaidInvoice],
    NewUser: [sendWelcomeEmail],
    WorkOrderCreated: [notifyAssigneeNewWO],
    WorkOrderUpdated: [notifyAssigneeUpdatedWO],
    WorkOrderCancelled: [notifyAssigneeCancelledWO],
    WorkOrderCompleted: [notifyAssignorCompletedWO],
  } as const satisfies Record<string, Array<BaseEventHandler>>;

  private getNamedEmitter<T extends FixitEventName>(name: T): NamedEmitFn<T> {
    return (...args) => this.emit(name, ...args);
  }

  emitCheckoutCompleted = this.getNamedEmitter("CheckoutCompleted");
  emitInvoiceCreated = this.getNamedEmitter("InvoiceCreated");
  emitInvoiceUpdated = this.getNamedEmitter("InvoiceUpdated");
  emitInvoiceDeleted = this.getNamedEmitter("InvoiceDeleted");
  emitInvoicePaid = this.getNamedEmitter("InvoicePaid");
  emitNewUser = this.getNamedEmitter("NewUser");
  emitWorkOrderCreated = this.getNamedEmitter("WorkOrderCreated");
  emitWorkOrderUpdated = this.getNamedEmitter("WorkOrderUpdated");
  emitWorkOrderCancelled = this.getNamedEmitter("WorkOrderCancelled");
  emitWorkOrderCompleted = this.getNamedEmitter("WorkOrderCompleted");

  constructor(eventHandlers = FixitEventEmitter.EVENT_HANDLERS) {
    super();
    // Register each event's handler functions
    for (const eventName in eventHandlers) {
      eventHandlers[eventName as FixitEventName].forEach((handler: BaseEventHandler) =>
        this.on(
          eventName,
          // Wrap each event handler in a try/catch block to prevent unhandled errors
          async (...args) => {
            await handler(args[0], args[1]).catch((error: unknown) => logger.error(error));
          }
        )
      );
    }
  }
}

export const eventEmitter = new FixitEventEmitter();

/** Map of Fixit event names to their respective handlers. */
export type FixitEventHandlers = typeof FixitEventEmitter.EVENT_HANDLERS;
/** The name of an event for which there's a registered listener. */
export type FixitEventName = keyof FixitEventHandlers;
/** A function which emits a FixitEvent. */
export type NamedEmitFn<EventName extends FixitEventName> = (
  ...args: Parameters<FixitEventHandlers[EventName][number]>
) => void;
/** Event handler base type. */
export type BaseEventHandler = (...args: any[]) => Promise<void>;

// This augments EventEmitter to only allow the names of configured events to be emitted.
declare module "events" {
  interface EventEmitter {
    emit(eventName: FixitEventName, ...args: unknown[]): boolean;
  }
}
