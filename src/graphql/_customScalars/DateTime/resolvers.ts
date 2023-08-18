import dayjs from "dayjs";
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { logger } from "@/utils/logger";
import { helpers } from "../helpers";

/** @returns boolean indicating whether the value is a valid DateTime scalar. */
const isValidGqlDateTimeScalar = (value: unknown) => {
  return (
    value !== undefined && value !== null && !dayjs(value as Parameters<typeof dayjs>[0]).isValid()
  );
};

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar; pass a string or js date instance obj",

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
