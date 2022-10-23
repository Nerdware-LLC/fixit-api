import { ClientInputError } from "@utils";
import type { Request, Response, NextFunction } from "express";

type ReqBodyValidatorFn = (body: Request["body"]) => boolean;

const getRequestBodyValidatorMW = (validatorFn: ReqBodyValidatorFn) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const isReqBodyValid = validatorFn(req.body);
    if (!isReqBodyValid) next(new ClientInputError("Invalid request"));

    next();
  };
};

// Just shortens some otherwise long lines below.
const hasKey = (obj: Record<string, any>, key: string) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

// XOR checks for login types.
// prettier-ignore
const xorLoginTypes = (req_body: Request["body"] & { type?: "LOCAL" | "GOOGLE_OAUTH" }) => {
  // password XOR googleID+googleAccessToken
  return (
    req_body?.type === "LOCAL"
      ? (hasKey(req_body, "password") && !hasKey(req_body, "googleID") && !hasKey(req_body, "googleAccessToken"))
      : req_body?.type === "GOOGLE_OAUTH"
      ? (!hasKey(req_body, "password") && hasKey(req_body, "googleID") && hasKey(req_body, "googleAccessToken"))
      : false
  );
};

// For req.baseUrl /auth/login
// prettier-ignore
export const validateLoginReqBody = getRequestBodyValidatorMW((body) => {
  // email AND ( password XOR googleAccessToken )
  return hasKey(body, "email") && xorLoginTypes(body);
});

// For req.baseUrl /auth/register
// prettier-ignore
export const validateUserRegReqBody = getRequestBodyValidatorMW((body) => {
  // email AND phone AND expoPushToken AND ( password XOR googleAccessToken )
  return (
    ["email", "phone", "expoPushToken"].every((key) => hasKey(body, key))
    && xorLoginTypes(body)
  );
});

// For req.baseUrl /subscriptions/submit-payment:
// prettier-ignore
export const validateSubmitPaymentReqBody = getRequestBodyValidatorMW((body) => {
  // selectedSubscription AND promoCode AND paymentMethodID
  return ["selectedSubscription", "promoCode", "paymentMethodID"].every((key) => hasKey(body, key));
});
