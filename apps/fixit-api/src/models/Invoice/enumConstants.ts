import type { InvoiceStatus } from "@/types/graphql.js";

export const INVOICE_ENUM_CONSTANTS: {
  readonly STATUSES: ReadonlyArray<InvoiceStatus>;
} = {
  STATUSES: ["OPEN", "CLOSED", "DISPUTED"] as const,
} as const;
