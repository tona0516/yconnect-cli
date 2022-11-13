import axios from "axios";
import pino from "pino";

const URL = {
  BASE: "https://userinfo.yahooapis.jp",
  ATTRIBUTE: "yconnect/v2/attribute",
};

export class Userinfo {
  logger: pino.Logger;

  constructor(logger: pino.Logger) {
    this.logger = logger;
  }

  async get(accessToken: string): Promise<{ [key: string]: string }> {
    const searchParams = new URLSearchParams();
    searchParams.append("access_token", accessToken);
    return await axios
      .get(`${URL.BASE}/${URL.ATTRIBUTE}?access_token=${accessToken}`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return error.response.data;
      });
  }
}
