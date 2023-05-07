import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { logger, EMAIL_REGEX } from "@utils";
import { helpers } from "../helpers";

export const resolvers = {
  Email: new GraphQLScalarType({
    name: "Email",
    description: "Custom Email scalar; validates using regex",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (typeof value === "string" && !EMAIL_REGEX.test(value)) {
        const errMsg = helpers.getScalarErrMsg("Email", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (typeof value === "string" && !EMAIL_REGEX.test(value)) {
        const errMsg = helpers.getScalarErrMsg("Email", value);
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
