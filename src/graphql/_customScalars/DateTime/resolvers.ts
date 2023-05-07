import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import moment from "moment";
import { logger } from "@utils/logger";
import { helpers } from "../helpers";

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar; pass a string or js date instance obj",

    // parseValue = value from the client
    parseValue(value: unknown) {
      if (!!value && !moment(value).isValid()) {
        const errMsg = helpers.getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value: unknown) {
      if (!!value && !moment(value).isValid()) {
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
