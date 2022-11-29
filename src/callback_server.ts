import url from "url";
import Express from "express";
import { inject, injectable } from "tsyringe";
import { Server } from "http";
import { Logger } from "./logger";

@injectable()
export class CallbackServer {
  server: Server | undefined;

  constructor(@inject("Logger") private logger: Logger) {}

  async create(
    frontendPath = "front",
    backendPath = "back",
    port = 3000
  ): Promise<string> {
    return new Promise((resolve) => {
      const express = Express();
      express.set("view engine", "ejs");
      express.set("views", `${__dirname}/../view`);

      express.get(
        `/${frontendPath}`,
        (req: Express.Request, res: Express.Response) => {
          res.render("./index.ejs", {
            port: port,
            backendPath: backendPath,
          });
        }
      );

      express.get(
        `/${backendPath}`,
        (req: Express.Request, res: Express.Response) => {
          res.sendStatus(200);
          const callbackUrl = decodeURIComponent(
            url.parse(req.url, true).query.callback_url as string
          );
          this.logger.debug("Callback URL", callbackUrl);
          resolve(callbackUrl);
        }
      );

      this.server = express.listen(port);
    });
  }

  close() {
    this.server?.closeAllConnections();
    this.server?.close();
  }
}
