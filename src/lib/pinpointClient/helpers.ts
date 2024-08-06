import { isString } from "@nerdware/ts-type-safety-utils";
import type { AddressConfiguration, ChannelType } from "@aws-sdk/client-pinpoint";

/**
 * An object defining the `to` field, the value of which must be one or more recipients for
 * a message. The format of each `to` value depends on the `ChannelType` of the message.
 */
export type PinpointMessageTo<Ch extends ChannelType | undefined = ChannelType> = {
  to?: string | Array<string>;
  ChannelType?: Ch;
  [key: string]: unknown;
};

/**
 * Pinpoint client helper for creating `Addresses` that all have the same `ChannelType`.
 */
export const fmtMessageAddresses = ({
  to,
  ChannelType,
}: Required<PinpointMessageTo>): Record<string, AddressConfiguration> => {
  const recipientsArray = isString(to) ? [to] : to;
  // prettier-ignore
  return recipientsArray.reduce(
    (accum: Record<string, AddressConfiguration>, toAddress) => {
      accum[toAddress] = { ChannelType };
      return accum;
    }, {}
  );
};
