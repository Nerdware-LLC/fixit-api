import { isString } from "@nerdware/ts-type-safety-utils";
import { UserInputError } from "@/utils/httpErrors.js";

/**
 * This function serves as a factory for creating {@link MapOfStringAttrHelpers} objects, which
 * map model attribute names to objects with `format` and `isValid` methods for formatting and
 * validating attribute values.
 *
 * @param attrInputs - A map of attribute names to {@link BaseStringAttrHelpersInput} objects.
 * @returns A {@link MapOfStringAttrHelpers} object.
 */
export const createMapOfStringAttrHelpers = <T extends BaseMapOfStringAttrHelpersInput>(
  attrInputs: T
) => {
  const attrHelpers: Partial<MapOfStringAttrHelpers<T>> = {};

  for (const attrName in attrInputs) {
    attrHelpers[attrName] = createHelpersForStrAttr(attrName, attrInputs[attrName]!);
  }

  return attrHelpers as MapOfStringAttrHelpers<T>;
};

/**
 * Creates a single attribute helper object for a string attribute.
 */
export const createHelpersForStrAttr = <T extends BaseStringAttrHelpersInput>(
  attrName: string,
  { regex, sanitize, ...configs }: T
) => {
  const isValid = (value?: unknown): value is string => isString(value) && regex.test(value);

  const validate = (value?: unknown) => {
    if (!isValid(value)) throw new UserInputError(`Invalid "${attrName}" value`);
  };

  return {
    ...configs,
    regex,
    isValid,
    validate,
    ...(!!sanitize && {
      sanitize,
      sanitizeAndValidate: (value: string) => {
        const sanitizedValue = sanitize(value);
        validate(sanitizedValue);
        return sanitizedValue;
      },
    }),
  } as unknown as StringAttrHelpers<T>;
};

///////////////////////////////////////////////////////////////////////////////
// INPUT TYPES:

type BaseMapOfStringAttrHelpersInput = Record<string, BaseStringAttrHelpersInput>;

type BaseStringAttrHelpersInput = {
  /** Validation regex used to create `isValid` and `validate` attribute helper methods. */
  regex: RegExp;
  /**
   * Sanitizes a value for the respective attribute by removing any invalid characters.
   * If provided, this method is used in the `validate` method before checking the value's validity.
   */
  sanitize?: (value: string) => string;
  /** Returns a string formatted for the respective attribute using the provided values. */
  format?: (...args: any[]) => string;
  [otherProperties: string]: unknown;
};

///////////////////////////////////////////////////////////////////////////////
// OUTPUT TYPES:

/** Map of attrName keys to methods for validating and formatting string attr values. */
export type MapOfStringAttrHelpers<
  T extends BaseMapOfStringAttrHelpersInput = BaseMapOfStringAttrHelpersInput,
> = { [AttrName in keyof T]: StringAttrHelpers<T[AttrName]> };

/** An object with methods for formatting and validating a string-attribute's values. */
type StringAttrHelpers<T extends BaseStringAttrHelpersInput = BaseStringAttrHelpersInput> = T & {
  /** Returns a boolean indicating whether the provided value is valid. */
  isValid: (value?: unknown) => boolean;
  /** Validates the provided value, and throws a {@link UserInputError} if invalid. */
  validate: (value?: unknown) => void;
  /** Sanitizes and validates the provided value, and throws a {@link UserInputError} if invalid. */
  sanitizeAndValidate: T["sanitize"] extends (value: string) => string
    ? (value: string) => string
    : never;
};
