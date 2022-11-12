import { OptionValues } from "commander"
import open from "open"
import { Server } from "./server"
import { AuthorizationParam, YConnect } from "./yconnect"

export class Usecase {
    async auth(options: OptionValues) {
        const yconnect = new YConnect()

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

        console.log("=== Authorization Response ===")
        console.log(authzResponse)
        console.log()

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

        console.log("=== Token Response ===")
        console.log(tokenResponse)
        console.log()
    }

    async refresh(options: OptionValues) {
        const yconnect = new YConnect()

        let tokenResponse = await yconnect.refreshToken(
            {
                clientId: options.clientId,
                refreshToken: options.refreshToken,
                clientSecret: options.clientSecret
            }
        )

        console.log("=== Token Response ===")
        console.log(tokenResponse)
        console.log()
    }
}
