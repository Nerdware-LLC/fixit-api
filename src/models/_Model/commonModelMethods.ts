export const COMMON_MODEL_METHODS = {
  getQueryModelMethod: ({
    index = "TABLE",
    pkAttributeName = DEFAULT_KEY_NAMES[index].pkAttribute,
    skAttributeName = DEFAULT_KEY_NAMES[index].skAttribute,
    skClause,
    limit
  }: {
    index: "TABLE" | "SK" | "Data";
    pkAttributeName: string; // for Dynamoose Model PK "map" names
    skAttributeName: string; // for Dynamoose Model SK "map" names
    skClause?: SortKeyClause;
    limit?: number;
  }) => {
    return index === "TABLE" && !!limit
      ? async function (this: any, pkValue: string) {
          return await this.query({ [pkAttributeName]: { eq: pkValue } })
            .limit(1)
            .exec();
        }
      : index === "TABLE" && !limit
      ? async function (this: any, pkValue: string) {
          return await this.query({ [pkAttributeName]: { eq: pkValue } })
            .and()
            .where({ [skAttributeName]: skClause })
            .exec();
        }
      : limit
      ? async function (this: any, pkValue: string) {
          return await this.query({ [pkAttributeName]: { eq: pkValue } })
            .limit(1)
            .using(`Overloaded_${index}_GSI`)
            .exec();
        }
      : async function (this: any, pkValue: string) {
          return await this.query({ [pkAttributeName]: { eq: pkValue } })
            .and()
            .where({ [skAttributeName]: skClause })
            .using(`Overloaded_${index}_GSI`)
            .exec();
        };
  }
};

interface SortKeyClause {
  eq?: SingleDDBvalueTypes; // equal-to
  lt?: SingleDDBvalueTypes; // less-than
  le?: SingleDDBvalueTypes; // less-than or equal-to
  gt?: SingleDDBvalueTypes; // greater-than
  ge?: SingleDDBvalueTypes; // greater-than or equal-to
  between?: [string, string] | [number, number];
  beginsWith?:
    | "#DATA#"
    | "SUBSCRIPTION#"
    | "STRIPE_CONNECT_ACCOUNT#"
    | "WO#"
    | "INV#"
    | "CONTACT#"
    | "PUSH_RECEIPT#";
}

type SingleDDBvalueTypes = string | number | boolean | null;

const DEFAULT_KEY_NAMES = {
  TABLE: { pkAttribute: "pk", skAttribute: "sk" },
  // GSIs:
  SK: { pkAttribute: "sk", skAttribute: "data" },
  Data: { pkAttribute: "data", skAttribute: "sk" }
};
