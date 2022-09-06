export const getTypeSafeErr = (err: ErrorLike) => {
  return err instanceof Error ? err : { error: JSON.stringify(err) };
};
