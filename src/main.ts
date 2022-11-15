import { Command, Option } from "commander";
import { Logger, Stdout } from "./logger";
import { Usecase } from "./usecase";

function main() {
  const program = new Command();

  program
    .name("yconnect-cli")
    .description("CLI for Yahoo! Identity Federation")
    .version("1.0.0", "-v, --version");

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
      const logger: Logger = new Stdout(options.debug);
      logger.info("Input parameters", options);
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
      const logger: Logger = new Stdout(options.debug);
      new Usecase(logger).refresh(options);
    });

  program
    .command("userinfo")
    .description("Get user data from UserInfoAPI.")
    .requiredOption("-a, --access-token <string>", "Access Token")
    .action((options) => {
      const logger: Logger = new Stdout(options.debug);
      new Usecase(logger).userinfo(options);
    });

  program.parse();
}

main();
