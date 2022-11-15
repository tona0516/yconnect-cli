import axios from "axios";
import { Logger } from "./logger";

const URL = {
  BASE: "https://userinfo.yahooapis.jp",
  ATTRIBUTE: "yconnect/v2/attribute",
};

export class Userinfo {
  logger: Logger;

  constructor(logger: Logger) {
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
