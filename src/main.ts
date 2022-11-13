import { Command, Option } from "commander";
import pino from "pino";
import { assertIsDefined } from "./util";
import { Usecase } from "./usecase";

function main() {
  const logger = pino({
    transport: {
      target: "pino-pretty",
      options: {
        ignore: "pid,hostname",
      },
    },
  });

  try {
    assertIsDefined("npm_package_name", process.env.npm_package_name);
    assertIsDefined(
      "npm_package_description",
      process.env.npm_package_description
    );
    assertIsDefined("npm_package_version", process.env.npm_package_version);
  } catch (e) {
    if (e instanceof Error) logger.fatal(e.message);
    process.exit(1);
  }

  const program = new Command();

  program
    .name(process.env.npm_package_name)
    .description(process.env.npm_package_description)
    .version(process.env.npm_package_version, "-v, --version");

  program
    .command("auth")
    .description("Authorize and getting tokens.")
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
    .option("--max-age <number>", "max_age")
    .option("--code-challenge <string>", "code_challenge")
    .option("--code-challenge-method <string>", "code_challenge_method")
    .addOption(new Option("-d, --debug", "debug mode").default(false))
    .action((options) => {
      logger.level = options.debug ? "debug" : "info";
      logger.info(options, "Input parameters");
      new Usecase(logger).auth(options);
    });

  program
    .command("refresh")
    .description("Refresh access token.")
    .requiredOption("-c, --client-id <string>", "Client ID")
    .requiredOption("-r, --refresh-token <string>", "Refresh Token")
    .option("--client-secret <string>", "Client Secret")
    .addOption(new Option("-d, --debug", "debug mode").default(false))
    .action((options) => {
      logger.level = options.debug ? "debug" : "info";
      logger.info(options, "Input parameters");
      new Usecase(logger).refresh(options);
    });

  program.parse();
}

main();
