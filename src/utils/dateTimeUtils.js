import moment from "moment";

// CONSTANTS
const NUMBER_OF_MILLISECONDS_PER_DAY = 86400000;
const DEFAULT_FORMATS = {
  date: "M/D/Y",
  time: "h:mm A"
};

// TIME
export const getTime = (dateTime, format) =>
  moment(dateTime).format(format ?? DEFAULT_FORMATS.time);

// DATE
export const getDate = (dateTime, format) =>
  moment(dateTime).format(format ?? DEFAULT_FORMATS.date);

// DATE-SHORT
export const getShortDate = (dateTime) => getDate(dateTime, "MMM Do");

// DATE-LONG
export const getLongDate = (dateTime) => getDate(dateTime, "dddd, MMMM Do, Y");

// VARIES BY DATE AGE
export const getShortDateOrTime = (dateTime) => {
  const woAgeInMS = new Date() - new Date(dateTime);
  const dateTimeDisplay =
    woAgeInMS > NUMBER_OF_MILLISECONDS_PER_DAY
      ? getShortDate(dateTime)
      : getTime(dateTime);
  return dateTimeDisplay;
};

// COMBOS
export const getDateTimeObj = (dateTime, formatObj) =>
  dateTime
    ? {
        date: getDate(dateTime, formatObj?.date ?? DEFAULT_FORMATS.date),
        time: getTime(dateTime, formatObj?.time ?? DEFAULT_FORMATS.time)
      }
    : { date: null, time: null };

// MERGE COMBOS
export const combineDateTimeStrings = (dateStr, timeStr, formatObj) => {
  return moment(
    `${dateStr} ${timeStr}`,
    `${formatObj?.date ?? DEFAULT_FORMATS.date} ${
      formatObj?.time ?? DEFAULT_FORMATS.time
    }`,
    true
  );
};

// COMPARE
export const areSameDateTimes = (dateTime1, dateTime2, granularity = "day") => {
  return moment(dateTime1).isValid() && moment(dateTime2).isValid()
    ? moment(dateTime1).isSame(dateTime2, granularity)
    : false;
};
