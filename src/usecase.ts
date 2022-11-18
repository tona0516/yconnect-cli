import { OptionValues } from "commander";
import open from "open";
import { Userinfo } from "./userinfo";
import { CallbackServer } from "./callback_server";
import { AuthorizationParam, YConnect } from "./yconnect";
import { Logger } from "./logger";
import { inject, injectable } from "tsyringe";

@injectable()
export class Usecase {
  constructor(
    @inject("Logger") private logger: Logger,
    @inject("YConnect") private yconnect: YConnect,
    @inject("Userinfo") private userinfo: Userinfo
  ) {}

  async authorize(options: OptionValues) {
    const yconnect = new YConnect(this.logger);

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
      codeChallenge: options.code_challenge as string,
      codeChallengeMethod: options.code_challenge_method as string,
    };
    this.logger.debug("Authorization Parameter", authzParam);

    const authzUrl = yconnect.authorization(authzParam);
    this.logger.debug("Authorization URL", authzUrl);

    open(authzUrl);

    const server = new CallbackServer();
    const callbackUrl = await server.create();
    this.logger.debug("Callback URL", callbackUrl);

    let authzResponse: { [key: string]: string } = {};
    if (callbackUrl.includes("#")) {
      authzResponse = Object.fromEntries(
        new URLSearchParams(new URL(callbackUrl).hash.substring(1))
      );
    }
    if (callbackUrl.includes("?")) {
      authzResponse = Object.fromEntries(new URL(callbackUrl).searchParams);
    }
    this.logger.info("Authorization Response", authzResponse);

    if (!authzResponse.code) {
      // - implicit flow
      // - bail=1 and no consent
      // - respond error
      this.logger.info(
        "Message",
        "No 'code' parameter in authorization response."
      );
      return;
    }

    const tokenResponse = await yconnect.issueToken({
      clientId: options.clientId as string,
      redirectUri: options.redirectUri as string,
      code: authzResponse.code,
      clientSecret: options.clientSecret as string,
    });

    this.logger.info("Token Response", tokenResponse);
  }

  async refresh(options: OptionValues) {
    const yconnect = new YConnect(this.logger);

    const tokenResponse = await yconnect.refreshToken({
      clientId: options.clientId as string,
      refreshToken: options.refreshToken as string,
      clientSecret: options.clientSecret as string,
    });

    this.logger.info("Token Response", tokenResponse);
  }

  async fetchUserinfo(options: OptionValues) {
    const userinfo = new Userinfo(this.logger);

    const userinfoResponse = await userinfo.get(options.accessToken as string);

    this.logger.info("Userinfo Response", userinfoResponse);
  }
}
