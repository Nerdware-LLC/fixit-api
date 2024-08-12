import dayjs from "dayjs";

/**
 * Mock dates used for testing. Each date is set to the first millisecond of their
 * respective day, and each uses the UTC time zone.
 */
export const MOCK_DATES = {
  /** Jan 1 2020 - used for User/Contact current/past date fields like `createdAt` */
  JAN_1_2020: new Date("2020-01-01T00:00:00.000Z"),
  /** Jan 2 2020 - used for User/Contact current/past date fields like `createdAt` */
  JAN_2_2020: new Date("2020-01-02T00:00:00.000Z"),
  /** Jan 3 2020 - used for User/Contact current/past date fields like `createdAt` */
  JAN_3_2020: new Date("2020-01-03T00:00:00.000Z"),
  /** Jan 1 2020 - used for WO/INV current/past date fields like `createdAt` */
  MAY_1_2020: new Date("2020-05-01T00:00:00.000Z"),
  /** Jan 2 2020 - used for WO/INV current/past date fields like `createdAt` */
  MAY_2_2020: new Date("2020-05-02T00:00:00.000Z"),
  /** Jan 3 2020 - used for WO/INV current/past date fields like `createdAt` */
  MAY_3_2020: new Date("2020-05-03T00:00:00.000Z"),
  /** Jan 1 2021 - used for "future" date fields like `UserSubscription.currentPeriodEnd` */
  JAN_1_2021: new Date("2021-01-01T00:00:00.000Z"),
} as const satisfies Record<string, Date>;

/**
 * Unix timestamps (seconds) for each date in {@link MOCK_DATES}.
 */
export const MOCK_DATE_UNIX_TIMESTAMPS = {
  JAN_1_2020: dayjs(MOCK_DATES.JAN_1_2020).unix(),
  JAN_2_2020: dayjs(MOCK_DATES.JAN_2_2020).unix(),
  JAN_3_2020: dayjs(MOCK_DATES.JAN_3_2020).unix(),
  MAY_1_2020: dayjs(MOCK_DATES.MAY_1_2020).unix(),
  MAY_2_2020: dayjs(MOCK_DATES.MAY_2_2020).unix(),
  MAY_3_2020: dayjs(MOCK_DATES.MAY_3_2020).unix(),
  JAN_1_2021: dayjs(MOCK_DATES.JAN_1_2021).unix(),
} as const satisfies Record<string, number>;
