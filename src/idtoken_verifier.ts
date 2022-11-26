import { Logger } from "./logger";
import { inject, injectable } from "tsyringe";
import { YConnect } from "./yconnect";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";

const ISS = "https://auth.login.yahoo.co.jp/yconnect/v2";

@injectable()
export class IdTokenVerifier {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject("YConnect") private yconnect: YConnect
  ) {}

  async verify(
    idToken: string,
    clientId: string,
    nonce: string,
    accessToken?: string,
    code?: string
  ): Promise<boolean> {
    const [header] = idToken.split(".");
    const decodedHeader = base64url.decode(header);
    const headerJson = JSON.parse(decodedHeader);

    const publicKeysResponse = await this.yconnect.publicKeys();

    this.logger.debug("PublicKeys Response", publicKeysResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payloadJson: any;
    try {
      payloadJson = jwt.verify(idToken, publicKeysResponse[headerJson.kid]);
    } catch (error) {
      this.logger.info(
        "ID Token verification result",
        "Invalid signature error"
      );
      return false;
    }

    if (payloadJson.iss !== ISS) {
      this.logger.info("ID Token verification result - invalid iss", {
        expected: ISS,
        actual: payloadJson.iss,
      });
      return false;
    }

    if (!payloadJson.aud.includes(clientId)) {
      this.logger.info(
        "ID Token verification result - Client ID is not contained aud",
        {
          target: clientId,
          actual: payloadJson.aud,
        }
      );
      return false;
    }

    if (nonce && payloadJson.nonce !== nonce) {
      this.logger.info("ID Token verification result - invalid nonce", {
        expected: nonce,
        actual: payloadJson.nonce,
      });
      return false;
    }

    if (accessToken) {
      const hash = createHash("sha256").update(accessToken).digest();
      const halfOfHash = hash.slice(0, hash.length / 2);
      const expectedAtHash = base64url.encode(halfOfHash);
      if (expectedAtHash !== payloadJson.at_hash) {
        this.logger.info("ID Token verification result - invalid at_hash", {
          expected: expectedAtHash,
          actual: payloadJson.at_hash,
        });
        return false;
      }
    }

    if (code) {
      const hash = createHash("sha256").update(code).digest();
      const halfOfHash = hash.slice(0, hash.length / 2);
      const expectedCHash = base64url.encode(halfOfHash);
      if (expectedCHash !== payloadJson.c_hash) {
        this.logger.info("ID Token verification result - invalid c_hash", {
          expected: expectedCHash,
          actual: payloadJson.c_hash,
        });
        return false;
      }
    }

    const currentTimeStamp = Date.now() / 1000;

    if (payloadJson.exp <= currentTimeStamp) {
      this.logger.info("ID Token verification result - expired", {
        current: currentTimeStamp,
        exp: payloadJson.exp,
      });
      return false;
    }

    return true;
  }
}
