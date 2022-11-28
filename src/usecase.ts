import open from "open";
import { UserinfoApi } from "./userinfoapi";
import { CallbackServer } from "./callback_server";
import { AuthorizationParam, YConnect } from "./yconnect";
import { Logger } from "./logger";
import { inject, injectable } from "tsyringe";
import { IdTokenVerifier } from "./idtoken_verifier";
import { Dic } from "./util";

@injectable()
export class Usecase {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject("CallbackServer") private callbackServer: CallbackServer,
    @inject("YConnect") private yconnect: YConnect,
    @inject("UserinfoApi") private userinfoApi: UserinfoApi,
    @inject("IdTokenVerifier") private idTokenVerifier: IdTokenVerifier
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(options: any) {
    if (options.debug) this.logger.enableDebug();
    this.logger.debug("Input parameters", options);

    const authzParam: AuthorizationParam = {
      responseType: options.responseType as string[],
      clientId: options.clientId as string,
      redirectUri: options.redirectUri as string,
      scope: options.scope as string[],
      bail: options.bail as boolean,
      state: options.state as string,
      nonce: options.nonce as string,
      display: options.display as string,
      prompt: options.prompt as string[],
      maxAge: options.maxAge as number,
      codeChallenge: options.codeChallenge as string,
      codeChallengeMethod: options.codeChallengeMethod as string,
    };
    this.logger.debug("Authorization Parameter", authzParam);

    const authzUrl = this.yconnect.generateAuthzURL(authzParam);
    this.logger.debug("Authorization URL", authzUrl);
    open(authzUrl);

    const callbackUrl = await this.callbackServer.create();
    this.logger.debug("Callback URL", callbackUrl);
    this.callbackServer.close();

    let authzResponse: Dic = {};
    if (callbackUrl.includes("#")) {
      authzResponse = Object.fromEntries(
        new URLSearchParams(new URL(callbackUrl).hash.substring(1))
      );
    }
    if (callbackUrl.includes("?")) {
      authzResponse = Object.fromEntries(new URL(callbackUrl).searchParams);
    }
    this.logger.info("Authorization Response", authzResponse);

    if (authzResponse.error) {
      return;
    }

    let publicKeysResponse: Dic = {};
    if (options.verify) {
      publicKeysResponse = await this.yconnect.publicKeys();
      this.logger.debug("`Public keys Response", publicKeysResponse);
    }

    if (options.verify) {
      if (authzResponse.id_token) {
        const [isValid, result] = this.idTokenVerifier.verify(
          authzResponse.id_token,
          options.clientId as string,
          options.nonce as string,
          publicKeysResponse,
          authzResponse.access_token,
          authzResponse.code
        );

        this.logger.info("ID Token verification", result);

        if (!isValid) {
          this.logger.info("ID Token verification", "ID Token is invalid.");
          return;
        }
      }
    }

    if (!authzResponse.code) {
      // - implicit flow
      // - bail=1 and no consent
      // - respond error
      return;
    }

    const tokenResponse = await this.yconnect.issueToken({
      clientId: options.clientId as string,
      redirectUri: options.redirectUri as string,
      code: authzResponse.code,
      clientSecret: options.clientSecret as string,
      codeVerifier: options.codeVerifier as string,
    });
    this.logger.info("Token Response", tokenResponse);

    if (tokenResponse.error) {
      return;
    }

    if (options.verify) {
      const [isValid, result] = this.idTokenVerifier.verify(
        tokenResponse.id_token,
        options.clientId as string,
        options.nonce as string,
        publicKeysResponse,
        tokenResponse.access_token,
        undefined
      );

      this.logger.info("ID Token verification", result);

      if (!isValid) {
        this.logger.info("ID Token verification", "ID Token is invalid.");
        return;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async refresh(options: any) {
    if (options.debug) this.logger.enableDebug();
    this.logger.debug("Input parameters", options);

    const tokenResponse = await this.yconnect.refreshToken({
      clientId: options.clientId as string,
      refreshToken: options.refreshToken as string,
      clientSecret: options.clientSecret as string,
    });

    this.logger.info("Token Response", tokenResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async fetchUserinfo(options: any) {
    if (options.debug) this.logger.enableDebug();
    this.logger.debug("Input parameters", options);

    const userinfoResponse = await this.userinfoApi.get(
      options.accessToken as string
    );

    this.logger.info("Userinfo Response", userinfoResponse);
  }
}
