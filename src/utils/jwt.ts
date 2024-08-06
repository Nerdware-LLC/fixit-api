import jwt, { type Algorithm } from "jsonwebtoken";
import { ENV } from "@/server/env";
import { AuthError } from "@/utils/httpErrors.js";

// Ensure the provided JWT algorithm is supported
if (!/^[HRE]S(256|384|512)$/.test(ENV.JWT.ALGORITHM)) {
  throw new Error("Unsupported JWT algorithm");
}

const jwtAlgorithm = ENV.JWT.ALGORITHM as Algorithm;

type BaseJwtPayload = jwt.JwtPayload & {
  id: string;
  [key: string]: unknown;
};

/**
 * JSON Web Token base util class for creating and validating JWTs.
 */
export class JWT {
  /**
   * Signs and encodes a JSON Web Token (JWT) using the provided payload and env vars.
   * @param payload - The payload data for the JWT; if `payload.id` is provided, it will be used as the JWT subject.
   * @returns The signed and encoded JWT string.
   */
  static readonly signAndEncode = <Payload extends BaseJwtPayload>(payload: Payload) => {
    return jwt.sign(payload, ENV.JWT.PRIVATE_KEY, {
      audience: ENV.CONFIG.API_BASE_URL,
      issuer: ENV.JWT.ISSUER,
      algorithm: jwtAlgorithm,
      expiresIn: ENV.JWT.EXPIRES_IN,
      subject: payload.id,
    });
  };

  static readonly DEFAULT_DECODE_ERR_MSGS: {
    [key: string]: string;
    TokenExpiredError: string;
    JsonWebTokenError: string;
    default: string;
  } = {
    TokenExpiredError: "Your token has expired",
    JsonWebTokenError: "Signature verification failed",
    default: "Invalid token",
  };

  /**
   * Validates and decodes a JSON Web Token (JWT) using the provided private key
   * and algorithm. It checks if the token is valid based on the shared parameters
   * and returns the decoded payload if successful.
   * @param token - The JWT to be validated and decoded.
   * @returns A Promise that resolves to a 'FixitApiJwtPayload' object representing the decoded JWT payload.
   * @throws An error if the token is invalid.
   */
  static readonly validateAndDecode = async <Payload extends BaseJwtPayload>(
    token: string,
    {
      decodeErrMsgs = JWT.DEFAULT_DECODE_ERR_MSGS,
      shouldStripInternalFields = true,
    }: {
      decodeErrMsgs?: Partial<typeof JWT.DEFAULT_DECODE_ERR_MSGS>;
      shouldStripInternalFields?: boolean;
    } = {}
  ): Promise<Payload> => {
    let decodedPayload = await new Promise<Payload>((resolve, reject) => {
      jwt.verify(
        token,
        ENV.JWT.PRIVATE_KEY,
        {
          audience: ENV.CONFIG.API_BASE_URL,
          issuer: ENV.JWT.ISSUER,
          algorithms: [jwtAlgorithm],
          maxAge: ENV.JWT.EXPIRES_IN,
        },
        (err, decoded) => {
          if (err || !decoded) {
            const errName = err?.name ?? "default";
            const errMsg =
              decodeErrMsgs[errName] ??
              decodeErrMsgs.default ??
              JWT.DEFAULT_DECODE_ERR_MSGS.default;
            reject(new AuthError(errMsg));
          }
          resolve(decoded as Payload);
        }
      );
    });

    if (shouldStripInternalFields) {
      decodedPayload = this.stripInternalPayloadFields(decodedPayload) as Payload;
    }

    return decodedPayload;
  };

  /**
   * Strips internal JWT payload fields from a given payload.
   * @param payload - The JWT payload to strip internal fields from.
   * @returns The stripped payload.
   */
  static readonly stripInternalPayloadFields = <Payload extends BaseJwtPayload>(
    payload: Payload
  ) => {
    // Filter out the internal JWT fields via destructuring.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { iss, sub, aud, exp, nbf, iat, jti, ...strippedPayload } = payload;
    return strippedPayload;
  };
}
