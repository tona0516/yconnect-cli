import { Logger } from "./logger";
import { inject, injectable } from "tsyringe";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const ISS = "https://auth.login.yahoo.co.jp/yconnect/v2";
const LogTitle = "ID Token verification result";

export interface IdTokenVerificationResult {
  extract_kid?: boolean;
  valid_signature?: boolean;
  valid_iss?: boolean;
  valid_aud?: boolean;
  valid_nonce?: boolean;
  valid_at_hash?: boolean;
  valid_c_hash?: boolean;
  not_expired?: boolean;
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
  constructor(@inject("Logger") private logger: Logger) {}

  verify(
    idToken: string,
    clientId: string,
    nonce: string,
    publicKeysResponse: { [key: string]: string },
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
      this.logger.debug(`${LogTitle} - invalid iss`, {
        expected: ISS,
        actual: payload.iss,
      });
      result.valid_iss = false;
    }

    if (payload.aud.includes(clientId)) {
      result.valid_aud = true;
    } else {
      this.logger.debug(`${LogTitle} - aud is not contained the Client ID`, {
        target: clientId,
        actual: payload.aud,
      });
      result.valid_aud = false;
    }

    if (nonce) {
      if (payload.nonce === nonce) {
        result.valid_nonce = true;
      } else {
        this.logger.debug(`${LogTitle} - invalid nonce`, {
          expected: nonce,
          actual: payload.nonce,
        });
        result.valid_nonce = false;
      }
    }

    if (accessToken) {
      if (this.verifyATHash(payload, accessToken)) {
        result.valid_at_hash = true;
      } else {
        result.valid_at_hash = false;
      }
    }

    if (code) {
      if (this.verifyCHash(payload, code)) {
        result.valid_c_hash = true;
      } else {
        result.valid_c_hash = false;
      }
    }

    const currentTimeStamp = Date.now() / 1000;
    if (payload.exp > currentTimeStamp) {
      result.not_expired = true;
    } else {
      this.logger.debug(`${LogTitle} - expired`, {
        current: currentTimeStamp,
        exp: payload.exp,
      });
      result.not_expired = false;
    }

    let isValid = true;
    Object.values(result).forEach((value) => {
      if (value === false) {
        isValid = false;
        return;
      }
    });

    return [isValid, result];
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
    publicKeysResponse: { [key: string]: string }
  ): Payload | undefined {
    try {
      return jwt.verify(idToken, publicKeysResponse[kid], {
        ignoreExpiration: true,
      }) as Payload;
    } catch (error) {
      return undefined;
    }
  }

  private verifyATHash(payload: Payload, accessToken: string): boolean {
    try {
      const expectedHash = this.createHash(accessToken);
      if (payload.at_hash === expectedHash) {
        return true;
      } else {
        this.logger.debug(`${LogTitle} - invalid at_hash`, {
          expected: expectedHash,
          actual: payload.at_hash,
        });
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private verifyCHash(payload: Payload, code: string): boolean {
    try {
      const expectedHash = this.createHash(code);
      if (payload.c_hash === expectedHash) {
        return true;
      } else {
        this.logger.debug(`${LogTitle} - invalid c_hash`, {
          expected: expectedHash,
          actual: payload.c_hash,
        });
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  private createHash(value: string): string {
    const hash = createHash("sha256").update(value).digest();
    const halfOfHash = hash.slice(0, hash.length / 2);
    return base64url.encode(halfOfHash);
  }
}
