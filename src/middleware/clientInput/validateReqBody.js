import { ClientInputError } from "@utils";

const getRequestBodyValidatorMW = (validatorFn) => {
  return (req, res, next) => {
    const isReqBodyValid = validatorFn(req.body);
    if (!isReqBodyValid) next(new ClientInputError("Invalid request"));

    next();
  };
};

// Just shortens some otherwise long lines below.
const hasKey = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// XOR checks for login types.
// prettier-ignore
const xorLoginTypes = (req_body) => {
  // password XOR googleAccessToken
  return (
    (hasKey(req_body, "password") || hasKey(req_body, "googleAccessToken"))
    && !(hasKey(req_body, "password") && hasKey(req_body, "googleAccessToken"))
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
  // userType AND email AND phone AND expoPushToken AND ( password XOR googleAccessToken )
  return (
    ["userType", "email", "phone", "expoPushToken"].every((key) => hasKey(body, key))
    && xorLoginTypes(body)
  );
});

// For req.baseUrl /subscriptions/submit-payment:
// prettier-ignore
export const validateSubmitPaymentReqBody = getRequestBodyValidatorMW((body) => {
  // selectedSubscription AND promoCode AND paymentMethodID
  return ["selectedSubscription", "promoCode", "paymentMethodID"].every((key) => hasKey(body, key));
});
