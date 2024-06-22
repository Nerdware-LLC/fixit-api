import { isValidEmail } from "@nerdware/ts-string-helpers";
import { GraphQLScalarType, Kind } from "graphql";
import { logger } from "@/utils/logger.js";
import { getScalarErrMsg } from "../helpers.js";
import type { Resolvers } from "@/types/graphql.js";

export const resolvers: Resolvers = {
  Email: new GraphQLScalarType({
    name: "Email",
    description: "Custom Email scalar with regex validation",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (!isValidEmail(value)) {
        const errMsg = getScalarErrMsg("Email", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (!isValidEmail(value)) {
        const errMsg = getScalarErrMsg("Email", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // ast value is always in string format
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? ast.value : null;
    },
  }),
};
