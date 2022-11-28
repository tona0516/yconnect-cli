import axios from "axios";
import { buildUrl } from "build-url-ts";
import { inject, injectable } from "tsyringe";
import { Dic } from "./util";
import { Logger } from "./logger";

const URL = {
  BASE: "https://auth.login.yahoo.co.jp",
  AUTHORIZATION: "yconnect/v2/authorization",
  TOKEN: "yconnect/v2/token",
  PUBLIC_KEYS: "yconnect/v2/public-keys",
};

const GrantType = {
  CODE: "authorization_code",
  REFRESH: "refresh_token",
};

export interface AuthorizationParam {
  responseType: string[];
  clientId: string;
  redirectUri: string;
  scope: string[];
  bail?: boolean;
  state?: string;
  nonce?: string;
  display?: string;
  prompt?: string[];
  maxAge?: number;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface IssueTokenParam {
  clientId: string;
  redirectUri: string;
  code: string;
  clientSecret?: string;
  codeVerifier?: string;
}

export interface RefreshTokenParam {
  clientId: string;
  refreshToken: string;
  clientSecret?: string;
}

@injectable()
export class YConnect {
  constructor(@inject("Logger") private logger: Logger) {}

  generateAuthzURL(param: AuthorizationParam): string {
    const query: Dic = {};
    query["response_type"] = [...param.responseType].join(" ");
    query["client_id"] = param.clientId;
    query["redirect_uri"] = param.redirectUri;
    query["scope"] = [...param.scope].join(" ");
    if (param.bail) {
      query["bail"] = "1";
    }
    if (param.state) {
      query["state"] = param.state;
    }
    if (param.nonce) {
      query["nonce"] = param.nonce;
    }
    if (param.display) {
      query["display"] = param.display;
    }
    if (param.prompt) {
      query["prompt"] = [...param.prompt].join(" ");
    }
    if (param.maxAge) {
      query["max_age"] = param.maxAge.toString();
    }
    if (param.codeChallenge) {
      query["code_challenge"] = param.codeChallenge;
    }
    if (param.codeChallengeMethod) {
      query["code_challenge_method"] = param.codeChallengeMethod;
    }

    return buildUrl(URL.BASE, {
      path: URL.AUTHORIZATION,
      queryParams: query,
    });
  }

  async issueToken(param: IssueTokenParam): Promise<Dic> {
    const searchParams = new URLSearchParams();
    searchParams.append("grant_type", GrantType.CODE);
    searchParams.append("client_id", param.clientId);
    searchParams.append("redirect_uri", param.redirectUri);
    searchParams.append("code", param.code);
    if (param.clientSecret) {
      searchParams.append("client_secret", param.clientSecret);
    }
    if (param.codeVerifier) {
      searchParams.append("code_verifier", param.codeVerifier);
    }

    return await axios
      .post(`${URL.BASE}/${URL.TOKEN}`, searchParams)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error.response.data;
      });
  }

  async refreshToken(param: RefreshTokenParam): Promise<Dic> {
    const searchParams = new URLSearchParams();
    searchParams.append("grant_type", GrantType.REFRESH);
    searchParams.append("client_id", param.clientId);
    searchParams.append("refresh_token", param.refreshToken);
    if (param.clientSecret) {
      searchParams.append("client_secret", param.clientSecret);
    }

    return await axios
      .post(`${URL.BASE}/${URL.TOKEN}`, searchParams)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error.response.data;
      });
  }

  async publicKeys(): Promise<Dic> {
    return await axios
      .get(`${URL.BASE}/${URL.PUBLIC_KEYS}`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error.response.data;
      });
  }
}
