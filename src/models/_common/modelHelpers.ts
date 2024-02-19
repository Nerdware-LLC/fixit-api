import { isString } from "@nerdware/ts-type-safety-utils";

/**
 * This function serves as a factory for creating {@link ModelHelpers} objects, which consist
 * of model attribute names as keys, each of which is given `format` and `isValid` methods for
 * formatting and validating attribute values respectively.
 *
 * @param modelHelperConfigs - A record of attribute names to {@link ModelHelperConfigInput} objects.
 * @returns A {@link ModelHelpers} object.
 */
export const createModelHelpers = <AttrInputs extends ModelHelpersInput>(
  modelHelpersInput: AttrInputs
) => {
  const modelHelpers: Record<string, ModelHelpersAttributeConfig> = {};

  for (const attrName in modelHelpersInput) {
    const { regex, ...configs } = modelHelpersInput[attrName]!;

    modelHelpers[attrName] = {
      ...configs,
      isValid: (value?: unknown) => isString(value) && regex.test(value),
    };
  }

  return modelHelpers as ModelHelpers<AttrInputs>;
};

/**
 * Record of attrName keys to methods for validating and formatting attr values.
 */
export type ModelHelpers<AttrConfigs extends ModelHelpersInput> = {
  [Key in keyof AttrConfigs]: ModelHelpersAttributeConfig<AttrConfigs[Key]>;
};

type ModelHelpersAttributeConfig<
  T extends ModelHelpersAttributeConfigInput = ModelHelpersAttributeConfigInput,
> = Omit<T, "regex"> & {
  /** Validates the provided value. */
  isValid: (value?: unknown) => boolean;
};

/** Parameters for {@link createModelHelpers} */
type ModelHelpersInput = Record<string, ModelHelpersAttributeConfigInput>;

type ModelHelpersAttributeConfigInput = {
  /** Returns a string formatted for the respective attribute using the provided values. */
  format: (...args: any[]) => string;
  regex: RegExp;
  [otherProperties: string]: any;
};
