import dayjs from "dayjs";
import { GraphQLScalarType, Kind } from "graphql";
import { logger } from "@/utils/logger.js";
import { helpers } from "../helpers.js";

/** @returns boolean indicating whether the value is a valid DateTime scalar. */
const isValidGqlDateTimeScalar = (value: unknown) => {
  return (
    value !== undefined && value !== null && !dayjs(value as Parameters<typeof dayjs>[0]).isValid()
  );
};

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar with handling for Date objects and datetime strings",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (!isValidGqlDateTimeScalar(value)) {
        const errMsg = helpers.getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (!isValidGqlDateTimeScalar(value)) {
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
