import dayjs, { type ConfigType as DayJsInputType } from "dayjs";

export type DateTimeFormatter = (dateTime: DayJsInputType, format?: string) => string;

/** A dictionary of commonly-used DayJS dateTime format strings. */
export const DAYJS_DATETIME_FORMATS = {
  date: "M/D/YY",
  shortDate: "MMM Do",
  longDate: "dddd, MMMM Do, YYYY",
  time: "h:mm A",
  dateAndTime: "M/D/YY h:mm a",
} as const;

const formatDateTime: DateTimeFormatter = (dateTime, format) => {
  return dayjs(dateTime).format(format);
};

/** Get a DayJS-formatted dateTime string in the format of `"h:mm A"`. */
export const getTimeStr: DateTimeFormatter = (dateTime) => {
  return formatDateTime(dateTime, DAYJS_DATETIME_FORMATS.time);
};

/** Get a DayJS-formatted dateTime string in the format of `"M/D/Y"`. */
export const getDateStr: DateTimeFormatter = (dateTime) => {
  return formatDateTime(dateTime, DAYJS_DATETIME_FORMATS.date);
};

/** Get a DayJS-formatted dateTime string in the format of `"M/D/Y h:mm a"`. */
export const getDateAndTimeStr: DateTimeFormatter = (dateTime) => {
  return formatDateTime(dateTime, DAYJS_DATETIME_FORMATS.dateAndTime);
};

/** Converts a Unix timestamp (<-- _**seconds**_) into a Date object. */
export const unixToDate = (unix: number) => new Date(unix * 1000);
