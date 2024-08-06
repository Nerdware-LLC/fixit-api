import {
  sanitizeAlphabetic,
  sanitizePhone,
  isValidPhone,
  sanitizeName,
  isValidName,
  sanitizeText,
  isValidText,
} from "@nerdware/ts-string-helpers";
import { z as zod } from "zod";
import {
  createChecklistItemZodSchema,
  updateChecklistItemZodSchema,
} from "@/graphql/Checklist/helpers.js";
import { locationInputZodSchema } from "@/graphql/Location/helpers.js";
import { userModelHelpers } from "@/models/User/helpers.js";
import { WORK_ORDER_ENUM_CONSTANTS as WO_ENUMS } from "@/models/WorkOrder/enumConstants.js";
import type { CreateWorkOrderInput, UpdateWorkOrderInput } from "@/types/graphql.js";
import type { ZodObjectWithShape } from "@/types/zod.js";

/**
 * Zod schema for {@link CreateWorkOrderInput} objects.
 */
export const createWorkOrderZodSchema = zod
  .object({
    assignedTo: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (value ? userModelHelpers.id.sanitize(value) : null))
      .refine((value) => (value ? userModelHelpers.id.validate(value) : value === null), {
        message: `Invalid user ID for field "assignedTo".`,
      }),
    category: zod
      .enum(WO_ENUMS.CATEGORIES)
      .nullish()
      .default(null)
      .transform((value) => (value ? (sanitizeAlphabetic(value) as typeof value) : value))
      .refine((value) => (value ? WO_ENUMS.CATEGORIES.includes(value) : true)),
    checklist: zod.array(createChecklistItemZodSchema).nullish().default(null),
    description: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (value ? sanitizeText(value) : value))
      .refine((value) => (value ? isValidText(value) : value === null)),
    dueDate: zod.date().nullish().default(null),
    entryContact: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (value ? sanitizeName(value) : value))
      .refine((value) => (value ? isValidName(value) : value === null)),
    entryContactPhone: zod
      .string()
      .nullish()
      .default(null)
      .transform((value) => (value ? sanitizePhone(value) : value))
      .refine((value) => (value ? isValidPhone(value) : value === null)),
    location: locationInputZodSchema,
    priority: zod
      .enum(WO_ENUMS.PRIORITIES)
      .nullish()
      .default("NORMAL")
      .transform((value) => (value ? (sanitizeAlphabetic(value) as typeof value) : value))
      .refine((value) => (value ? WO_ENUMS.PRIORITIES.includes(value) : true)),
    scheduledDateTime: zod.date().nullish().default(null),
  })
  .strict() satisfies ZodObjectWithShape<CreateWorkOrderInput>;

/**
 * Zod schema for {@link UpdateWorkOrderInput} objects.
 */
export const updateWorkOrderZodSchema = createWorkOrderZodSchema.omit({ assignedTo: true }).extend({
  assignedToUserID: zod
    .string()
    .nullish()
    .default(null)
    .transform((value) => (value ? userModelHelpers.id.sanitize(value) : null))
    .refine((value) => (value ? userModelHelpers.id.validate(value) : value === null), {
      message: `Invalid user ID for field "assignedTo".`,
    }),
  location: locationInputZodSchema.nullish().default(null),
  checklist: zod.array(updateChecklistItemZodSchema).nullish().default(null),
}) satisfies ZodObjectWithShape<UpdateWorkOrderInput>;
