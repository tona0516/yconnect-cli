"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const commander_1 = require("commander");
const dependency_injection_1 = require("./dependency_injection");
function main() {
    const container = dependency_injection_1.DependencyInjection.getInstance().container;
    const usecase = container.resolve("Usecase");
    const program = new commander_1.Command();
    program
        .name("yconnect-cli")
        .description("CLI for Yahoo! Identity Federation")
        .version("1.0.3", "-v, --version");
    program
        .command("auth")
        .description("Authorize and getting tokens.")
        .requiredOption("-c, --client-id <string>", "Client ID")
        .option("--client-secret <string>", "Client Secret")
        .addOption(new commander_1.Option("--response-type <string...>", "response_type").default([
        "code",
    ]))
        .addOption(new commander_1.Option("--redirect-uri <string>", "redirect_uri").default("http://localhost:3000/front"))
        .addOption(new commander_1.Option("--scope <string...>", "scope").default(["openid"]))
        .option("--bail", "bail")
        .option("--state <string>", "state")
        .option("--nonce <string>", "nonce")
        .option("--display <string>", "display")
        .option("--prompt <string...>", "prompt")
        .option("--max-age <number>", "max_age")
        .option("--code-challenge <string>", "code_challenge")
        .option("--code-challenge-method <string>", "code_challenge_method")
        .addOption(new commander_1.Option("-d, --debug", "debug mode").default(false))
        .action((options) => {
        usecase.authorize(options);
    });
    program
        .command("refresh")
        .description("Refresh access token.")
        .requiredOption("-c, --client-id <string>", "Client ID")
        .requiredOption("-r, --refresh-token <string>", "Refresh Token")
        .option("--client-secret <string>", "Client Secret")
        .addOption(new commander_1.Option("-d, --debug", "debug mode").default(false))
        .action((options) => {
        usecase.refresh(options);
    });
    program
        .command("userinfo")
        .description("Get user data from UserInfoAPI.")
        .requiredOption("-a, --access-token <string>", "Access Token")
        .action((options) => {
        usecase.fetchUserinfo(options);
    });
    program.parse();
}
main();
//# sourceMappingURL=main.js.map