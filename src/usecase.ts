import { OptionValues } from "commander";
import open from "open";
import * as pino from "pino";
import { Userinfo } from "./userinfo";
import { Server } from "./server";
import { AuthorizationParam, YConnect } from "./yconnect";

export class Usecase {
  logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.logger = logger;
  }

  async auth(options: OptionValues) {
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

    const authzUrl = yconnect.authorization(authzParam);
    open(authzUrl);

    const server = new Server();
    const callbackUrl = await server.create();

    let authzResponse: { [key: string]: string } = {};
    if (callbackUrl.includes("#")) {
      authzResponse = Object.fromEntries(
        new URLSearchParams(new URL(callbackUrl).hash.substring(1))
      );
    }
    if (callbackUrl.includes("?")) {
      authzResponse = Object.fromEntries(new URL(callbackUrl).searchParams);
    }

    this.logger.info(authzResponse, "Authorization Response");

    if (!authzResponse.code) {
      // implicit もしくは bail=1で同意キャンセル もしくは エラー
      return;
    }

    const tokenResponse = await yconnect.issueToken({
      clientId: options.clientId as string,
      redirectUri: options.redirectUri as string,
      code: authzResponse.code,
      clientSecret: options.clientSecret as string,
    });

    this.logger.info(tokenResponse, "Token Response");
  }

  async refresh(options: OptionValues) {
    const yconnect = new YConnect(this.logger);

    const tokenResponse = await yconnect.refreshToken({
      clientId: options.clientId as string,
      refreshToken: options.refreshToken as string,
      clientSecret: options.clientSecre as string,
    });

    this.logger.info(tokenResponse, "Token Response");
  }

  async userinfo(options: OptionValues) {
    const userinfo = new Userinfo(this.logger);

    const tokenResponse = await userinfo.get(options.accessToken as string);

    this.logger.info(tokenResponse, "Userinfo Response");
  }
}
