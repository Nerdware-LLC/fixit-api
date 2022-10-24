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

const hasValidLoginKeys = (req_body: Request["body"] & { type?: "LOCAL" | "GOOGLE_OAUTH" }) => {
  return req_body?.type === "LOCAL"
    ? hasKey(req_body, "password")
    : req_body?.type === "GOOGLE_OAUTH"
    ? hasKey(req_body, "googleID") && hasKey(req_body, "googleAccessToken")
    : false;
};

// For req.baseUrl /auth/login --> email AND ( password OR googleAccessToken )
export const validateLoginReqBody = getRequestBodyValidatorMW((body) => {
  return hasKey(body, "email") && hasValidLoginKeys(body);
});

// For req.baseUrl /auth/register --> email AND phone AND expoPushToken AND ( password OR googleAccessToken )
export const validateUserRegReqBody = getRequestBodyValidatorMW((body) => {
  return (
    ["email", "phone", "expoPushToken"].every((key) => hasKey(body, key)) && hasValidLoginKeys(body)
  );
});

// For req.baseUrl /subscriptions/submit-payment --> selectedSubscription AND promoCode AND paymentMethodID
export const validateSubmitPaymentReqBody = getRequestBodyValidatorMW((body) => {
  return ["selectedSubscription", "promoCode", "paymentMethodID"].every((key) => hasKey(body, key));
});
