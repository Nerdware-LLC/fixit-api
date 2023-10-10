/**
 * This function serves as a factory for creating {@link ModelHelpers} objects, which consist
 * of model attribute names as keys, each of which is given `format` and `isValid` methods for
 * formatting and validating attribute values respectively.
 *
 * @param modelHelperConfigs - A record of attribute names to {@link ModelHelperConfigInput} objects.
 * @returns A {@link ModelHelpers} object.
 */
export const createModelHelpers = <ModelHelperConfigs extends ModelHelperConfigInput>(
  modelHelperConfigs: ModelHelperConfigs
): ModelHelpers<ModelHelperConfigs> => {
  const modelHelpers = {} as ModelHelpers<ModelHelperConfigs>;

  for (const attrName in modelHelperConfigs) {
    const { regex, ...configs } = modelHelperConfigs[attrName];

    modelHelpers[attrName] = {
      ...configs,
      isValid: (value?: unknown) => typeof value === "string" && regex.test(value),
    };
  }

  return modelHelpers;
};

/**
 * Parameters for {@link createModelHelpers}.
 */
type ModelHelperConfigInput = Record<
  string,
  {
    /** Returns a string formatted for the respective attribute using the provided values. */
    format: (...args: any[]) => string;
    regex: RegExp;
    [otherProperties: string]: any;
  }
>;

/**
 * Record of attrName keys to methods for validating and formatting attr values.
 */
export type ModelHelpers<AttrConfigs extends ModelHelperConfigInput> = {
  [Key in keyof AttrConfigs]: Omit<AttrConfigs[Key], "regex"> & {
    /** Validates the provided value. */
    isValid: (value?: unknown) => boolean;
  };
};
