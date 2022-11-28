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
exports.YConnect = void 0;
const axios_1 = __importDefault(require("axios"));
const build_url_ts_1 = require("build-url-ts");
const tsyringe_1 = require("tsyringe");
const logger_1 = require("./logger");
const URL = {
    BASE: "https://auth.login.yahoo.co.jp",
    AUTHORIZATION: "yconnect/v2/authorization",
    TOKEN: "yconnect/v2/token",
    PUBLIC_KEYS: "yconnect/v2/public-keys",
};
const GrantType = {
    CODE: "authorization_code",
    REFRESH: "refresh_token",
};
let YConnect = class YConnect {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    generateAuthzURL(param) {
        const query = {};
        query["response_type"] = [...param.responseType].join(" ");
        query["client_id"] = param.clientId;
        query["redirect_uri"] = param.redirectUri;
        query["scope"] = [...param.scope].join(" ");
        if (param.bail) {
            query["bail"] = "1";
        }
        if (param.state) {
            query["state"] = param.state;
        }
        if (param.nonce) {
            query["nonce"] = param.nonce;
        }
        if (param.display) {
            query["display"] = param.display;
        }
        if (param.prompt) {
            query["prompt"] = [...param.prompt].join(" ");
        }
        if (param.maxAge) {
            query["max_age"] = param.maxAge.toString();
        }
        if (param.codeChallenge) {
            query["code_challenge"] = param.codeChallenge;
        }
        if (param.codeChallengeMethod) {
            query["code_challenge_method"] = param.codeChallengeMethod;
        }
        return (0, build_url_ts_1.buildUrl)(URL.BASE, {
            path: URL.AUTHORIZATION,
            queryParams: query,
        });
    }
    async issueToken(param) {
        const searchParams = new URLSearchParams();
        searchParams.append("grant_type", GrantType.CODE);
        searchParams.append("client_id", param.clientId);
        searchParams.append("redirect_uri", param.redirectUri);
        searchParams.append("code", param.code);
        if (param.clientSecret) {
            searchParams.append("client_secret", param.clientSecret);
        }
        if (param.codeVerifier) {
            searchParams.append("code_verifier", param.codeVerifier);
        }
        return await axios_1.default
            .post(`${URL.BASE}/${URL.TOKEN}`, searchParams)
            .then(function (response) {
            return response.data;
        })
            .catch(function (error) {
            return error.response.data;
        });
    }
    async refreshToken(param) {
        const searchParams = new URLSearchParams();
        searchParams.append("grant_type", GrantType.REFRESH);
        searchParams.append("client_id", param.clientId);
        searchParams.append("refresh_token", param.refreshToken);
        if (param.clientSecret) {
            searchParams.append("client_secret", param.clientSecret);
        }
        return await axios_1.default
            .post(`${URL.BASE}/${URL.TOKEN}`, searchParams)
            .then(function (response) {
            return response.data;
        })
            .catch(function (error) {
            return error.response.data;
        });
    }
    async publicKeys() {
        return await axios_1.default
            .get(`${URL.BASE}/${URL.PUBLIC_KEYS}`)
            .then(function (response) {
            return response.data;
        })
            .catch(function (error) {
            return error.response.data;
        });
    }
};
YConnect = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __metadata("design:paramtypes", [logger_1.Logger])
], YConnect);
exports.YConnect = YConnect;
//# sourceMappingURL=yconnect.js.map