import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import moment from "moment";
import { logger, EMAIL_REGEX } from "@utils";

export const resolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "Custom DateTime scalar; pass a string or js date instance obj",

    // parseValue = value from the client
    parseValue(value) {
      if (!moment(value).isValid()) {
        const errMsg = _getScalarErrMsg("DateTime", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value) {
      if (!moment(value).isValid()) {
        const errMsg = _getScalarErrMsg("DateTime", value);
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
    }
  }),

  Email: new GraphQLScalarType({
    name: "Email",
    description: "Custom Email scalar; validates using regex",

    // parseValue = value from the client
    parseValue(value) {
      if (!EMAIL_REGEX.test(value)) {
        const errMsg = _getScalarErrMsg("Email", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // serialize = value sent to the client
    serialize(value) {
      if (!EMAIL_REGEX.test(value)) {
        const errMsg = _getScalarErrMsg("Email", value);
        logger.gql(errMsg);
        throw new TypeError(errMsg);
      }
      return value;
    },

    // ast value is always in string format
    parseLiteral(ast) {
      return ast.kind === Kind.STRING ? ast.value : null;
    }
  })
};

const _getScalarErrMsg = (scalarType, invalidValue) => {
  // prettier-ignore
  return `[${scalarType.toUpperCase()} SCALAR ERROR]: Client provided an invalid ${scalarType.toLowerCase()}: ${JSON.stringify(invalidValue)}`;
};
