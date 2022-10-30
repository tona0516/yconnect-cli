import { Command, Option } from 'commander';
import { Usecase } from './usecase';

function main() {
    const program = new Command()

    program
        .name(process.env.npm_package_name!)
        .description(process.env.npm_package_description!)
        .version(process.env.npm_package_version!, "-v, --version")

    program
        .command("auth")
        .description("Authorize and getting tokens.")
        .requiredOption('-c, --client-id <string>', 'Client ID')
        .option('--client-secret <string>', 'Client Secret')
        .addOption(new Option('--response-type <string...>', 'response_type').default(["code"]))
        .addOption(new Option('--redirect-uri <string>', 'redirect_uri').default("http://localhost:3000/front"))
        .addOption(new Option('--scope <string...>', 'scope').default(["openid"]))
        .option('--bail', 'bail')
        .option('--state <string>', 'state')
        .option('--nonce <string>', 'nonce')
        .option('--display <string>', 'display')
        .option('--prompt <string...>', 'prompt')
        .option('--max-age <number>', 'max-age')
        .option('--code-challenge <string>', 'code-challenge')
        .option('--code-challenge-method <string>', 'code-challenge-method <number>')
        .action((options) => {
            console.log(options)
            new Usecase().auth(options)
        })

    program.parse()
}

main()
