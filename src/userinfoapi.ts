import axios from "axios";
import { inject, injectable } from "tsyringe";
import { Dic } from "./util";
import { Logger } from "./logger";

const URL = {
  BASE: "https://userinfo.yahooapis.jp",
  ATTRIBUTE: "yconnect/v2/attribute",
};

@injectable()
export class UserinfoApi {
  constructor(@inject("Logger") private logger: Logger) {}

  async get(accessToken: string): Promise<Dic> {
    const searchParams = new URLSearchParams();
    searchParams.append("access_token", accessToken);
    return await axios
      .get(`${URL.BASE}/${URL.ATTRIBUTE}?access_token=${accessToken}`)
      .then((response) => {
        this.logger.debug("UserInfo Endpoint Response", response);
        return response.data;
      })
      .catch((error) => {
        this.logger.debug("UserInfo Endpoint Response", error);
        return error.response.data;
      });
  }
}
