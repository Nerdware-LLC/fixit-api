import { isString } from "@nerdware/ts-type-safety-utils";
import { z as zod } from "zod";
import { userModelHelpers } from "@/models/User/helpers.js";
import { workOrderModelHelpers as woModelHelpers } from "@/models/WorkOrder/helpers.js";
import type { InvoiceInput } from "@/types/graphql.js";
import type { ZodObjectWithShape } from "@/types/zod.js";
import type { UndefinedOnPartialDeep } from "type-fest";

/**
 * Zod schema for {@link InvoiceInput} objects.
 */
export const createInvoiceZodSchema = zod
  .object({
    amount: zod.number().positive().int(),
    assignedTo: zod
      .string()
      .transform(userModelHelpers.id.sanitize)
      .refine(userModelHelpers.id.isValid, { message: "Invalid value for field: 'assignedTo'" }),
    workOrderID: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (isString(value) ? woModelHelpers.id.sanitize(value) : null))
      .refine((value) => (isString(value) ? woModelHelpers.id.isValid(value) : true), {
        message: "Invalid value for field: 'workOrderID'",
      }),
  })
  .strict() satisfies ZodObjectWithShape<UndefinedOnPartialDeep<InvoiceInput>>;
