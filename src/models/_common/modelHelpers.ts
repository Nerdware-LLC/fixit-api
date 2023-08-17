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
 * Record of attrName keys to methods for creating and validating attr values.
 */
export type ModelHelpers<AttrConfigs extends ModelHelperConfigInput> = {
  [Key in keyof AttrConfigs]: Omit<AttrConfigs[Key], "regex"> & {
    /** Validates the provided value. */
    isValid: (value?: unknown) => boolean;
  };
};
