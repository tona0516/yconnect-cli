import url from "url";
import Express from "express";

export class Server {
  async create(
    frontendPath = "front",
    backendPath = "back",
    port = 3000,
    windowCloseTimeoutSec = 5
  ): Promise<string> {
    return new Promise((resolve) => {
      const express = Express();
      express.set("view engine", "ejs");
      express.set("views", "./view");

      express.get(
        `/${frontendPath}`,
        (req: Express.Request, res: Express.Response) => {
          res.render("./index.ejs", {
            port: port,
            backendPath: backendPath,
            windowCloseTimeoutSec: windowCloseTimeoutSec,
          });
        }
      );

      express.get(
        `/${backendPath}`,
        (req: Express.Request, res: Express.Response) => {
          res.sendStatus(200);
          server.closeAllConnections();
          server.close();
          const callbackUrl = decodeURIComponent(
            url.parse(req.url, true).query.callback_url as string
          );
          resolve(callbackUrl);
        }
      );

      const server = express.listen(port);
    });
  }
}
