import { Command, Option } from "commander";
import pino from "pino";
import { Usecase } from "./usecase";

function main() {
  const program = new Command();
  const logger = pino({
    name: process.env.npm_package_name!,
    transport: {
      target: "pino-pretty",
      options: {
        ignore: "pid,hostname",
      },
    },
  });

  program
    .name(process.env.npm_package_name!)
    .description(process.env.npm_package_description!)
    .version(process.env.npm_package_version!, "-v, --version");

  program
    .command("auth")
    .description("Authorize and getting tokens.")
    .addOption(new Option("-d, --debug", "debug mode").default(false))
    .requiredOption("-c, --client-id <string>", "Client ID")
    .option("--client-secret <string>", "Client Secret")
    .addOption(
      new Option("--response-type <string...>", "response_type").default([
        "code",
      ])
    )
    .addOption(
      new Option("--redirect-uri <string>", "redirect_uri").default(
        "http://localhost:3000/front"
      )
    )
    .addOption(new Option("--scope <string...>", "scope").default(["openid"]))
    .option("--bail", "bail")
    .option("--state <string>", "state")
    .option("--nonce <string>", "nonce")
    .option("--display <string>", "display")
    .option("--prompt <string...>", "prompt")
    .option("--max-age <number>", "max-age")
    .option("--code-challenge <string>", "code-challenge")
    .option(
      "--code-challenge-method <string>",
      "code-challenge-method <number>"
    )
    .action((options) => {
      logger.level = options.debug ? "debug" : "info";
      logger.info(options, "Input parameters");
      new Usecase(logger).auth(options);
    });

  program
    .command("refresh")
    .description("Refresh access token.")
    .addOption(new Option("-d, --debug", "debug mode").default(false))
    .requiredOption("-c, --client-id <string>", "Client ID")
    .requiredOption("-r, --refresh-token <string>", "Refresh Token")
    .option("--client-secret <string>", "Client Secret")
    .action((options) => {
      logger.level = options.debug ? "debug" : "info";
      logger.info(options, "Input parameters");
      new Usecase(logger).refresh(options);
    });

  program.parse();
}

main();
