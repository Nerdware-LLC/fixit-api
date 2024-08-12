/**
 * Intl API objects
 */
export const i18nFormats = {
  enUS: {
    number: {
      currency: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }),
      currencyRounded: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
      percentage: new Intl.NumberFormat("en-US", { style: "percent" }),
    },
  },
} as const;

/**
 * Supported locales (currently only `enUS`)
 */
export type SupportedLocale = keyof typeof i18nFormats;
