import { ddbSingleTable, Model } from "@lib/dynamoDB";
import { COMMON_MODEL_ATTRIBUTES } from "@models/_common";
import { USER_ID_REGEX } from "@models/User";
import { WORK_ORDER_ID_REGEX, LOCATION_COMPOSITE_REGEX, WO_CHECKLIST_ITEM_ID_REGEX } from "./regex";
import { createOne } from "./createOne";
import { updateOne } from "./updateOne";
import type { ModelSchemaType, ModelSchemaOptions } from "@lib/dynamoDB";

/**
 * WorkOrder Model Methods:
 * @method `createOne()`
 * @method `updateOne()`
 * @method `queryWorkOrderByID()`
 * @method `queryUsersWorkOrders()`
 * @method `queryWorkOrdersAssignedToUser()`
 */
export class WorkOrderModel extends Model<typeof WorkOrderModel.schema> {
  static readonly schema: ModelSchemaType = {
    pk: {
      type: "string",
      alias: "createdByUserID",
      validate: (value: string) => USER_ID_REGEX.test(value)
    },
    sk: {
      type: "string",
      alias: "id",
      validate: (value: string) => WORK_ORDER_ID_REGEX.test(value)
    },
    data: {
      type: "string",
      alias: "assignedToUserID",
      validate: (value: string) => USER_ID_REGEX.test(value)
    },
    status: {
      type: "string",
      required: true,
      validate: (value: typeof WorkOrderModel.STATUSES[number]) => {
        return WorkOrderModel.STATUSES.includes(value);
      }
    },
    priority: {
      type: "string",
      required: true,
      default: "NORMAL",
      validate: (value: typeof WorkOrderModel.PRIORITIES[number]) => {
        return WorkOrderModel.PRIORITIES.includes(value);
      }
    },
    location: {
      type: "string", // [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]
      required: true,
      /* Clients provide "location" as an object with properties "country", "region", "city",
      "streetLine1", and "streetLine2". set() converts these client location input objects into
      a string which adheres to the above pattern and serves as a composite attribute value.
      Storing "location" in this way makes it possible to flexibly query the DynamoDB db for
      access patterns like "Find all work orders on Foo Street".  */
      transformValue: {
        toDB: ({
          country: countryRawInput = "USA",
          region: regionRawInput, // Region examples: US states, Canadian provinces
          city: cityRawInput,
          streetLine1: streetLine1RawInput,
          streetLine2: streetLine2RawInput = null
        }: {
          country?: string;
          region: string;
          city: string;
          streetLine1: string;
          streetLine2?: string | null;
        }) => {
          // reduce returns the "location" composite value as a single string with "#" as the field delimeter
          return [
            countryRawInput,
            regionRawInput,
            cityRawInput,
            streetLine1RawInput,
            streetLine2RawInput
          ].reduce((accum, currentRawInput, index) => {
            // "streetLine2RawInput" is optional - skip processing if null
            if (currentRawInput === null) return accum;

            /* For all "location" values, underscores are not valid in the raw input, but we
            can't catch underscores in the "validation" Dynamoose Model attribute regex since
            spaces are replaced with underscores. We could `throw new Error` from this "set"
            Model fn if the raw input includes an underscore, but at this time throwing from
            "set" does not result in a proper validation error msg. So instead, underscores
            are replaced with the string literal "%_UNDERSCORE_%"; since "%" signs are invalid
            chars, the "validation" field regex catches the invalid input, and the resultant
            error message properly informs the user that underscores are invalid.  */
            let formattedInput = currentRawInput.replace(/_/g, "%_UNDERSCORE_%");

            // For all "location" values, replace spaces with underscores
            formattedInput = formattedInput.replace(/\s/g, "_");

            /* "streetLine2RawInput" (index 4) may include "#" chars (e.g., "Ste_#_398"), so
            any provided number signs need to be replaced since they're used as the composite
            value delimeter. Here they're replaced with the string literal "NUMSIGN".
            For all other "location" fields, num signs are invalid, so like the treatment of
            underscores described above, invalid num signs are replaced with the string literal
            "%_NUMSIGN_%" so the "validation" function can catch it.  */
            formattedInput = formattedInput.replace(/#/g, index === 4 ? "NUMSIGN" : "%_NUMSIGN_%");

            /* All segments of the "location" composite attribute value except for the
            first one ("country") must be prefixed with "#", the delimeter.         */
            accum = index !== 0 ? `${accum as string}#${formattedInput}` : formattedInput;

            return accum;
          }, "" as string); // <-- reducer init accum is an empty string
        },
        fromDB: (locationValue: string) => {
          // Return "location" object from db format: [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]

          // Split the composite value string using the "#" delimeter
          return locationValue.split("#").reduce((accum, dbValue, index) => {
            // Replace "NUMSIGN" string literal with "#" (for streetLine2)
            let formattedOutput = dbValue.replace(/NUMSIGN/g, "#");

            // Replace underscores with spaces
            formattedOutput = formattedOutput.replace(/_/g, " ");

            // Get location key from array
            const locationKey = ["country", "region", "city", "streetLine1", "streetLine2"][index];

            // Set location key + value
            accum[locationKey] = formattedOutput;

            return accum;
          }, {} as Record<string, string>); // <-- reducer init accum is an empty object
        }
      },
      validate: (value: string) => LOCATION_COMPOSITE_REGEX.test(value)
    },
    category: {
      type: "string",
      required: false,
      validate: (value: typeof WorkOrderModel.CATEGORIES[number]) => {
        return WorkOrderModel.CATEGORIES.includes(value);
      }
    },
    description: {
      type: "string",
      required: false
    },
    checklist: {
      type: "array",
      required: false,
      schema: [
        {
          type: "map",
          schema: {
            // prettier-ignore
            id: { type: "string", required: true, validate: (value: string) => WO_CHECKLIST_ITEM_ID_REGEX.test(value) },
            description: { type: "string", required: true },
            isCompleted: { type: "boolean", required: true, default: false }
          }
        }
      ]
    },
    entryContact: {
      type: "string",
      required: false
    },
    entryContactPhone: {
      ...COMMON_MODEL_ATTRIBUTES.PHONE,
      required: false
    },
    dueDate: {
      ...COMMON_MODEL_ATTRIBUTES.DATETIME,
      required: false
    },
    scheduledDateTime: {
      ...COMMON_MODEL_ATTRIBUTES.DATETIME,
      required: false
    },
    contractorNotes: {
      type: "string",
      required: false
    }
  };

  static readonly schemaOptions: ModelSchemaOptions = {
    transformItem: {
      toDB: (workOrderItem: { id: string; checklist?: Array<{ createdAt: Date }> }) => ({
        ...workOrderItem,
        ...(Array.isArray(workOrderItem?.checklist) && {
          checklist: workOrderItem.checklist.map((checklistItem) => ({
            ...checklistItem,
            // prettier-ignore
            id: `${workOrderItem.id}#CHECKLIST_ITEM#${Math.floor(new Date(checklistItem.createdAt).getTime() / 1000)}`
          }))
        })
      })
    }
  };

  static readonly PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;
  static readonly STATUSES = [
    "UNASSIGNED", // <-- WO has not been assigned to anyone
    "ASSIGNED", //   <-- WO has merely been assigned to someone
    "CANCELLED", //  <-- Assignor can not delete ASSIGNED/COMPLETE WOs, only mark them as "CANCELLED" (deleted from db after 90 days if not updated nor attached to an Invoice)
    "COMPLETE" //    <-- Assignee notifies Assignor that WO is "COMPLETE" (may be reverted to "ASSIGNED" by either party)
  ] as const;
  static readonly CATEGORIES = [
    "Drywall",
    "Electrical",
    "Flooring",
    "General",
    "HVAC",
    "Landscaping",
    "Masonry",
    "Painting",
    "Paving",
    "Pest",
    "Plumbing",
    "Roofing",
    "Trash",
    "Turnover",
    "Windows"
  ] as const;

  constructor() {
    super(ddbSingleTable, "WorkOrder", WorkOrderModel.schema, WorkOrderModel.schemaOptions);
  }

  // WORK ORDER SUBSCRIPTION MODEL — Instance property getters
  // The below getters allow static enums to be read from the model instance (for convenience)

  get PRIORITIES() {
    return WorkOrderModel.PRIORITIES;
  }
  get STATUSES() {
    return WorkOrderModel.STATUSES;
  }
  get CATEGORIES() {
    return WorkOrderModel.CATEGORIES;
  }

  // WORK ORDER MODEL — Instance methods:

  readonly createOne = createOne;

  readonly updateOne = updateOne;

  readonly queryWorkOrderByID = async (workOrderID: string) => {
    return await this.query({
      IndexName: "Overloaded_SK_GSI",
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": workOrderID },
      Limit: 1
    });
  };

  readonly queryUsersWorkOrders = async (userID: string) => {
    return await this.query({
      KeyConditionExpression: "pk = :userID AND begins_with(sk, :woSKprefix)",
      ExpressionAttributeValues: { ":userID": userID, ":woSKprefix": "WO#" }
    });
  };

  readonly queryWorkOrdersAssignedToUser = async (userID: string) => {
    return await this.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "assignedToUserID = :userID AND begins_with(sk, :woSKprefix)",
      ExpressionAttributeValues: { ":userID": userID, ":woSKprefix": "WO#" }
    });
  };
}

export const WorkOrder = new WorkOrderModel();
