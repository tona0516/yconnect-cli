import { OptionValues } from "commander"
import open from "open"
import { Server } from "./server"
import { AuthorizationParam, YConnect } from "./yconnect"
import * as pino from "pino";

export class Usecase {
    logger: pino.Logger

    constructor(logger: pino.Logger) {
        this.logger = logger;
    }

    async auth(options: OptionValues) {
        const yconnect = new YConnect(this.logger)

        const authzParam: AuthorizationParam = {
            responseType: options.responseType,
            clientId: options.clientId,
            redirectUri: options.redirectUri,
            scope: options.scope,
            bail: options.bail,
            state: options.state,
            nonce: options.nonce,
            display: options.display,
            prompt: options.prompt,
            maxAge: options.maxAge,
            codeChallenge: options.code_challenge,
            codeChallengeMethod: options.code_challenge_method,
        }

        const authzUrl = yconnect.authorization(authzParam)
        open(authzUrl)

        const server = new Server()
        const callbackUrl = await server.create()

        var authzResponse: { [key: string]: string } = {}
        if (callbackUrl.includes("#")) {
            authzResponse = Object.fromEntries(new URLSearchParams(new URL(callbackUrl).hash.substring(1)))
        }
        if (callbackUrl.includes("?")) {
            authzResponse = Object.fromEntries(new URL(callbackUrl).searchParams)
        }

        this.logger.info(authzResponse, "Authorization Response")

        if (!authzResponse.code) {
            // implicit もしくは bail=1で同意キャンセル もしくは エラー
            return
        }

        let tokenResponse = await yconnect.issueToken(
            {
                clientId: options.clientId,
                redirectUri: options.redirectUri,
                code: authzResponse.code,
                clientSecret: options.clientSecret
            }
        )

        this.logger.info(tokenResponse, "Token Response")
    }

    async refresh(options: OptionValues) {
        const yconnect = new YConnect(this.logger)

        let tokenResponse = await yconnect.refreshToken(
            {
                clientId: options.clientId,
                refreshToken: options.refreshToken,
                clientSecret: options.clientSecret
            }
        )

        this.logger.info(tokenResponse, "Token Response")
    }
}
