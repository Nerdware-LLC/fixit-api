import { GraphQLScalarType, Kind } from "graphql";
import { logger } from "@/utils/logger.js";
import { isValidTimestamp } from "@/utils/timestamps.js";
import { helpers } from "../helpers.js";

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar with handling for Date objects and datetime strings",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (!isValidTimestamp(value)) {
        const errMsg = helpers.getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (!isValidTimestamp(value)) {
        const errMsg = helpers.getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // ast value is always in string format
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
};
