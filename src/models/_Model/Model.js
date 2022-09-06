import merge from "lodash.merge";
import { dynamoose } from "@lib/dynamoDBclient";
import { COMMON_MODEL_ATTRIBUTES } from "./commonModelAttributes";
import { COMMON_MODEL_METHODS } from "./commonModelMethods";

/* Note: Dynamoose order of operations

  - map/alias/aliases mapping (toDynamo only)
  - Type Checking
  - Defaults
  - Custom Types
  - DynamoDB Type Handler (ex. converting sets to correct value)
  - Combine
  - get/set modifiers
  - Schema level get/set modifiers
  - Validation check
  - Schema level validation check
  - Required check
  - Enum check
  - map/alias/aliases mapping (fromDynamo only)
*/

export class Model {
  static BASE_SCHEMA = {
    pk: {
      type: String,
      hashKey: true,
      required: true
    },
    sk: {
      type: String,
      rangeKey: true,
      required: true,
      index: {
        // For relational queryies using "sk" as the hash key
        name: "Overloaded_SK_GSI",
        global: true,
        rangeKey: "data", // TODO Double check - is any model using this GSI sk?
        project: true // all attributes
      }
    },
    data: {
      type: String,
      required: true,
      index: {
        // For relational queries using "data" as the hash key
        name: "Overloaded_Data_GSI",
        global: true,
        rangeKey: "sk", // WO queryWorkOrdersAssignedToUser uses this GSI SK
        project: true // all attributes
      }
    }
  };

  static BASE_SCHEMA_OPTS = {
    saveUnknown: false,
    timestamps: true
  };

  static makeDynamooseModel = (
    modelName,
    { ITEM_SCHEMA, ITEM_SCHEMA_OPTS = {}, MODEL_METHODS = null }
  ) => {
    const newModel = dynamoose.model(
      modelName,
      merge(Model.BASE_SCHEMA, ITEM_SCHEMA),
      merge(Model.BASE_SCHEMA_OPTS, ITEM_SCHEMA_OPTS)
    );

    if (MODEL_METHODS) {
      Object.entries(MODEL_METHODS).forEach(([methodName, methodFn]) =>
        newModel.methods.set(methodName, methodFn)
      );
    }

    return newModel;
  };

  static COMMON_MODEL_ATTRIBUTES = COMMON_MODEL_ATTRIBUTES;
  static COMMON_MODEL_METHODS = COMMON_MODEL_METHODS;
}
