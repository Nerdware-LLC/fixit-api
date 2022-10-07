export const generateUpdateExpression = (itemAttributes: { [k: string]: any }) => {
  // prettier-ignore
  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues
  } = Object.entries(itemAttributes).reduce<ReducerAccum>(
    (accum, [topLevelKey, topLevelValue]) => {
      /* Attribute names and values in the UpdateExpression are replaced by token-placeholders,
      which here are derived by removing all non-letter characters from the key, and then adding
      a num-sign prefix to the attr-name token and a colon prefix to the the attr-value token. For
      example, an attribute "foo" would yield clause "#fooName = :fooValue" in the update expr. */

      // Remove non-letter chars from the key
      const attrNameLetters = topLevelKey.replace(/[^a-zA-Z]/g, "");
      // Derive the name/value tokens
      const attrNameToken = `#${attrNameLetters}`;
      const attrValueToken = `:${attrNameLetters}`;
      // Derive and append the new update expression clause
      accum.UpdateExpression += ` ${attrNameToken} = ${attrValueToken},`;
      // Update ExpressionAttribute{Names,Values}
      accum.ExpressionAttributeNames[attrNameToken] = topLevelKey;
      accum.ExpressionAttributeValues[attrValueToken] = topLevelValue;

      return accum;
    },
    { UpdateExpression: "SET", ExpressionAttributeNames: {}, ExpressionAttributeValues: {} }
  );

  return {
    UpdateExpression: UpdateExpression.slice(0, -1), // <-- removes last comma
    ExpressionAttributeNames,
    ExpressionAttributeValues
  };
};

type ReducerAccum = {
  UpdateExpression: string;
  ExpressionAttributeNames: Record<string, any>;
  ExpressionAttributeValues: Record<string, any>;
};
