import { GraphQLScalarType, Kind } from "graphql";
import { logger } from "@/utils/logger.js";
import { isValidTimestamp } from "@/utils/timestamps.js";
import { getScalarErrMsg } from "../helpers.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar with handling for Date objects and datetime strings",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (!isValidTimestamp(value)) {
        const errMsg = getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (!isValidTimestamp(value)) {
        const errMsg = getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // ast value is always in string format
    parseLiteral(ast) {
      return ast.kind === Kind.INT ? new Date(ast.value) : null;
    },
  }),
};
