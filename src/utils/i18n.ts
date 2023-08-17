/**
 * Intl API objects
 */
export const i18nFormats = {
  number: {
    currency: {
      enUS: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
    },
  },
};
