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
    this.logger.debug("Input Parameters", options);

    const redirectUri = "http://localhost:3000/front";
    const authzParam: AuthorizationParam = {
      responseType: options.responseType,
      clientId: options.clientId,
      redirectUri: redirectUri,
      scope: options.scope,
      bail: options.bail,
      state: options.state,
      nonce: options.nonce,
      display: options.display,
      prompt: options.prompt,
      maxAge: options.maxAge,
      codeChallenge: options.codeChallenge,
      codeChallengeMethod: options.codeChallengeMethod,
    };
    const authzUrl = this.yconnect.generateAuthzURL(authzParam);
    open(authzUrl);

    const callbackUrl = await this.callbackServer.create();
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
    }

    if (options.verify) {
      if (authzResponse.id_token) {
        const [isValid, result] = this.idTokenVerifier.verify(
          authzResponse.id_token,
          options.clientId,
          publicKeysResponse,
          options.nonce,
          authzResponse.access_token,
          authzResponse.code
        );

        this.logger.info("ID Token Verification", result);

        if (!isValid) {
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

    if (
      options.state &&
      authzResponse.state &&
      options.state !== authzResponse.state
    ) {
      this.logger.info("Authorization Response Validation", {
        message: "state is invalid",
        expected: options.state,
        actual: authzResponse.state,
      });
      return;
    }

    const tokenResponse = await this.yconnect.issueToken({
      clientId: options.clientId,
      redirectUri: redirectUri,
      code: authzResponse.code,
      clientSecret: options.clientSecret,
      codeVerifier: options.codeVerifier,
    });
    this.logger.info("Token Response", tokenResponse);

    if (tokenResponse.error) {
      return;
    }

    if (options.verify) {
      const [isValid, result] = this.idTokenVerifier.verify(
        tokenResponse.id_token,
        options.clientId,
        publicKeysResponse,
        options.nonce,
        tokenResponse.access_token,
        undefined
      );

      this.logger.info("ID Token Verification", result);

      if (!isValid) {
        return;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async refresh(options: any) {
    if (options.debug) this.logger.enableDebug();
    this.logger.debug("Input Parameters", options);

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
    this.logger.debug("Input Parameters", options);

    const userinfoResponse = await this.userinfoApi.get(
      options.accessToken as string
    );

    this.logger.info("Userinfo Response", userinfoResponse);
  }
}
