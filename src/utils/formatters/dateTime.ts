/**
 * Converts a Unix timestamp (<-- _**seconds**_) into a Date object.
 */
export const unixTimestampToDate = (unix: number) => new Date(unix * 1000);
