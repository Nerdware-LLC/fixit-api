export const generateUpdateExpression = (itemAttributes: { [k: string]: any }) => {
  // prettier-ignore
  const {
    UpdateExpression,
    ExpressionAttributeValues
  } = Object.entries(itemAttributes).reduce<ReducerAccum>(
    (accum, [topLevelKey, topLevelValue]) => {
      /* The value in the UpdateExpression must be replaced by a token-placeholder,
      which here is derived by removing all non-letter characters from the key, and
      adding a colon prefix.  */
      const valueTokenPlaceholder = `:${topLevelKey.replace(/[^a-zA-Z]/g, "")}`;

      accum.UpdateExpression += ` ${topLevelKey} = ${valueTokenPlaceholder},`;

      accum.ExpressionAttributeValues[valueTokenPlaceholder] = topLevelValue;

      return accum;
    },
    { UpdateExpression: "SET", ExpressionAttributeValues: {} }
  );

  return {
    UpdateExpression: UpdateExpression.slice(0, -1), // <-- removes last comma
    ExpressionAttributeValues
  };
};

type ReducerAccum = {
  UpdateExpression: string;
  ExpressionAttributeValues: Record<string, any>;
};
