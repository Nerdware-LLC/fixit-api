import { Model } from "@models/_Model";
import { USER_ID_REGEX } from "@models/User";
import { UNIX_TIMESTAMP_REGEX_STR } from "@utils/regex";
import { WORK_ORDER_ID_REGEX, WORK_ORDER_ID_REGEX_STR, LOCATION_COMPOSITE_REGEX } from "./regex";
import { WorkOrderEnums } from "./WorkOrderEnums";
import { createOne } from "./createOne";
import { updateOne } from "./updateOne";

export const WorkOrder = Model.makeDynamooseModel("WorkOrder", {
  ITEM_SCHEMA: {
    pk: {
      map: "createdByUserID",
      validate: USER_ID_REGEX
    },
    sk: {
      map: "id",
      validate: WORK_ORDER_ID_REGEX
    },
    data: {
      map: "assignedToUserID",
      validate: USER_ID_REGEX
    },
    status: {
      type: String,
      required: true,
      enum: WorkOrderEnums.STATUSES
    },
    priority: {
      type: String,
      required: true,
      enum: WorkOrderEnums.PRIORITY,
      default: "NORMAL"
    },
    location: {
      type: String, // [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]
      required: true,
      /* Clients provide "location" as an object with properties "country", "region", "city",
      "streetLine1", and "streetLine2". set() converts these client location input objects into
      a string which adheres to the above pattern and serves as a composite attribute value.
      Storing "location" in this way makes it possible to flexibly query the DynamoDB db for
      access patterns like "Find all work orders on Foo Street".  */
      set: ({
        country: countryRawInput = "USA",
        region: regionRawInput, // Region examples: US states, Canadian provinces
        city: cityRawInput,
        streetLine1: streetLine1RawInput,
        streetLine2: streetLine2RawInput = null
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
          accum = index !== 0 ? `${accum}#${formattedInput}` : formattedInput;

          return accum;
        }, ""); // <-- reducer init accum is an empty string
      },
      get: (locationValue) => {
        // Return "location" object from db format: [COUNTRY]#[STATE]#[CITY]#[STREET_LINE_1]#[STREET_LINE_2]

        // Split the composite value string using the "#" delimeter
        return locationValue.split("#").reduce((accum, dbValue, index) => {
          // Replace "NUMSIGN" string literal with "#" (for streetLine2)
          let formattedOutput = dbValue.replace(/NUMSIGN/g, "#");

          // Replace underscores with spaces
          formattedOutput = formattedOutput.replace(/_/g, " ");

          // Get location key from cached array (below Model)
          const locationKey = LOCATION_SPLIT_INDEX_KEYS[index];

          // Set location key + value
          accum[locationKey] = formattedOutput;

          return accum;
        }, {}); // <-- reducer init accum is an empty object
      },
      validation: LOCATION_COMPOSITE_REGEX
    },
    category: {
      type: String,
      required: false,
      default: null,
      enum: WorkOrderEnums.CATEGORIES
    },
    description: {
      type: String,
      required: false
    },
    checklist: {
      type: Array,
      required: false,
      default: null,
      schema: [
        {
          type: Object,
          schema: {
            // prettier-ignore
            id: { type: String, required: true, validation: new RegExp(`^${WORK_ORDER_ID_REGEX_STR}#CHECKLIST_ITEM#${UNIX_TIMESTAMP_REGEX_STR}$`) },
            description: { type: String, required: true },
            isCompleted: { type: Boolean, required: true, default: false }
          }
        }
      ]
    },
    entryContact: {
      type: String,
      required: false
    },
    entryContactPhone: {
      ...Model.COMMON_MODEL_ATTRIBUTES.PHONE,
      required: false
    },
    dueDate: {
      ...Model.COMMON_MODEL_ATTRIBUTES.DATETIME,
      required: false
    },
    scheduledDateTime: {
      ...Model.COMMON_MODEL_ATTRIBUTES.DATETIME,
      required: false
    },
    contractorNotes: {
      type: String,
      required: false
    }
  },
  ITEM_SCHEMA_OPTS: {
    set: (workOrderItem) => {
      const workOrderID = `WO#${workOrderItem.createdByUserID}#${workOrderItem.createdAt}`;

      return {
        ...workOrderItem,
        id: workOrderID,
        checklist: Array.isArray(workOrderItem?.checklist ?? null)
          ? workOrderItem.checklist.map((checklistItem) => {
              return Object.prototype.hasOwnProperty.call(checklistItem, "id")
                ? checklistItem // <-- retain "id" if exists
                : {
                    id: `${workOrderID}#CHECKLIST_ITEM#${checklistItem?.createdAt ?? Date.now()}`, // TODO Make sure this Date.now isn't overwriting IDs on existing checklist items
                    ...checklistItem
                  };
            })
          : null
      };
    }
  },
  MODEL_METHODS: {
    createOne,
    updateOne,
    queryWorkOrderByID: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      index: "SK",
      pkAttributeName: "id",
      limit: 1
    }),
    queryUsersWorkOrders: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      pkAttributeName: "createdByUserID",
      skAttributeName: "id",
      skClause: { beginsWith: "WO#" }
    }),
    queryWorkOrdersAssignedToUser: Model.COMMON_MODEL_METHODS.getQueryModelMethod({
      index: "Data",
      pkAttributeName: "assignedToUserID",
      skAttributeName: "id",
      skClause: { beginsWith: "WO#" }
    })
  }
});

// This is used for quick lookups in "location" get() fn.
const LOCATION_SPLIT_INDEX_KEYS = ["country", "region", "city", "streetLine1", "streetLine2"];
