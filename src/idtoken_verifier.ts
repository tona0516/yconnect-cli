import { Logger } from "./logger";
import { inject, injectable } from "tsyringe";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { Dic } from "./util";
import { Clock } from "./clock";

const ISS = "https://auth.login.yahoo.co.jp/yconnect/v2";

export interface IdTokenVerificationResult {
  extract_kid?: boolean;
  valid_signature?: boolean;
  valid_iss?: boolean;
  iss_error_detail?: object;
  valid_aud?: boolean;
  aud_error_detail?: object;
  valid_nonce?: boolean;
  nonce_error_detail?: object;
  valid_at_hash?: boolean;
  at_hash_error_detail?: object;
  valid_c_hash?: boolean;
  c_hash_error_detail?: object;
  not_expired?: boolean;
  expire_error_detail?: object;
}

interface Payload {
  iss: string;
  sub: string;
  aud: string[];
  exp: number;
  iat: number;
  nonce?: string;
  amr?: string[];
  at_hash?: string;
  c_hash?: string;
}

@injectable()
export class IdTokenVerifier {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject("Clock") private clock: Clock
  ) {}

  verify(
    idToken: string,
    clientId: string,
    publicKeysResponse: Dic,
    nonce?: string,
    accessToken?: string,
    code?: string
  ): [boolean, IdTokenVerificationResult] {
    const result: IdTokenVerificationResult = {};

    const kid = this.extractKid(idToken);
    if (!kid) {
      result.extract_kid = false;
      return [false, result];
    }
    result.extract_kid = true;

    const payload = this.verifySignature(idToken, kid, publicKeysResponse);
    if (!payload) {
      result.valid_signature = false;
      return [false, result];
    }
    result.valid_signature = true;

    if (payload.iss === ISS) {
      result.valid_iss = true;
    } else {
      result.valid_iss = false;
      result.iss_error_detail = {
        message: "invalid iss",
        expected: ISS,
        actual: payload.iss,
      };
    }

    if (payload.aud.includes(clientId)) {
      result.valid_aud = true;
    } else {
      result.valid_aud = false;
      result.aud_error_detail = {
        message: "aud is not contained the Client ID",
        expected: clientId,
        actual: payload.aud,
      };
    }

    if (nonce) {
      if (payload.nonce === nonce) {
        result.valid_nonce = true;
      } else {
        result.valid_nonce = false;
        result.nonce_error_detail = {
          message: "invalid nonce",
          expected: nonce,
          actual: payload.nonce,
        };
      }
    }

    if (accessToken) {
      const [isValid, expected] = this.verifyHash(accessToken, payload.at_hash);
      if (isValid) {
        result.valid_at_hash = true;
      } else {
        result.valid_at_hash = false;
        result.at_hash_error_detail = {
          message: "invalid at_hash",
          expected: expected,
          actual: payload.at_hash,
        };
      }
    }

    if (code) {
      const [isValid, expected] = this.verifyHash(code, payload.c_hash);
      if (isValid) {
        result.valid_c_hash = true;
      } else {
        result.valid_c_hash = false;
        result.c_hash_error_detail = {
          message: "invalid c_hash",
          expected: expected,
          actual: payload.at_hash,
        };
      }
    }

    const current = this.clock.currentUnixtime();
    if (payload.exp > current) {
      result.not_expired = true;
    } else {
      result.not_expired = false;
      result.expire_error_detail = {
        message: "expired",
        current: current,
        expiration: payload.exp,
      };
    }

    if (Object.values(result).filter((value) => value === false).length === 0) {
      return [true, result];
    } else {
      return [false, result];
    }
  }

  private extractKid(idToken: string): string | undefined {
    try {
      const [rawHeader] = idToken.split(".");
      const decodedHeader = base64url.decode(rawHeader);
      return JSON.parse(decodedHeader).kid;
    } catch (error) {
      return undefined;
    }
  }

  private verifySignature(
    idToken: string,
    kid: string,
    publicKeysResponse: Dic
  ): Payload | undefined {
    try {
      return jwt.verify(idToken, publicKeysResponse[kid], {
        ignoreExpiration: true,
      }) as Payload;
    } catch (error) {
      return undefined;
    }
  }

  private verifyHash(value: string, hashInPayload?: string): [boolean, string] {
    const hash = createHash("sha256").update(value).digest();
    const halfOfHash = Uint8Array.from(hash).slice(0, hash.length / 2);
    const expectedHash = base64url.encode(Buffer.from(halfOfHash));
    return [hashInPayload === expectedHash, expectedHash];
  }
}
