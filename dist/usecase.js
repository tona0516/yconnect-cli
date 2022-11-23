"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usecase = void 0;
const open_1 = __importDefault(require("open"));
const userinfoapi_1 = require("./userinfoapi");
const callback_server_1 = require("./callback_server");
const yconnect_1 = require("./yconnect");
const logger_1 = require("./logger");
const tsyringe_1 = require("tsyringe");
let Usecase = class Usecase {
    logger;
    callbackServer;
    yconnect;
    userinfoApi;
    constructor(logger, callbackServer, yconnect, userinfoApi) {
        this.logger = logger;
        this.callbackServer = callbackServer;
        this.yconnect = yconnect;
        this.userinfoApi = userinfoApi;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authorize(options) {
        if (options.debug)
            this.logger.enableDebug();
        this.logger.debug("Input parameters", options);
        const authzParam = {
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
            codeChallenge: options.codeChallenge,
            codeChallengeMethod: options.codeChallengeMethod,
        };
        this.logger.debug("Authorization Parameter", authzParam);
        const authzUrl = this.yconnect.generateAuthzURL(authzParam);
        this.logger.debug("Authorization URL", authzUrl);
        (0, open_1.default)(authzUrl);
        const callbackUrl = await this.callbackServer.create();
        this.logger.debug("Callback URL", callbackUrl);
        this.callbackServer.close();
        let authzResponse = {};
        if (callbackUrl.includes("#")) {
            authzResponse = Object.fromEntries(new URLSearchParams(new URL(callbackUrl).hash.substring(1)));
        }
        if (callbackUrl.includes("?")) {
            authzResponse = Object.fromEntries(new URL(callbackUrl).searchParams);
        }
        this.logger.info("Authorization Response", authzResponse);
        if (!authzResponse.code) {
            // - implicit flow
            // - bail=1 and no consent
            // - respond error
            return;
        }
        const tokenResponse = await this.yconnect.issueToken({
            clientId: options.clientId,
            redirectUri: options.redirectUri,
            code: authzResponse.code,
            clientSecret: options.clientSecret,
        });
        this.logger.info("Token Response", tokenResponse);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async refresh(options) {
        if (options.debug)
            this.logger.enableDebug();
        this.logger.debug("Input parameters", options);
        const tokenResponse = await this.yconnect.refreshToken({
            clientId: options.clientId,
            refreshToken: options.refreshToken,
            clientSecret: options.clientSecret,
        });
        this.logger.info("Token Response", tokenResponse);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async fetchUserinfo(options) {
        if (options.debug)
            this.logger.enableDebug();
        this.logger.debug("Input parameters", options);
        const userinfoResponse = await this.userinfoApi.get(options.accessToken);
        this.logger.info("Userinfo Response", userinfoResponse);
    }
};
Usecase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __param(1, (0, tsyringe_1.inject)("CallbackServer")),
    __param(2, (0, tsyringe_1.inject)("YConnect")),
    __param(3, (0, tsyringe_1.inject)("UserinfoApi")),
    __metadata("design:paramtypes", [logger_1.Logger,
        callback_server_1.CallbackServer,
        yconnect_1.YConnect,
        userinfoapi_1.UserinfoApi])
], Usecase);
exports.Usecase = Usecase;
//# sourceMappingURL=usecase.js.map