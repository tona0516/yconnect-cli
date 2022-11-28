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
exports.IdTokenVerifier = void 0;
const logger_1 = require("./logger");
const tsyringe_1 = require("tsyringe");
const base64url_1 = __importDefault(require("base64url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const ISS = "https://auth.login.yahoo.co.jp/yconnect/v2";
const LogTitle = "ID Token verification result";
let IdTokenVerifier = class IdTokenVerifier {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    verify(idToken, clientId, nonce, publicKeysResponse, accessToken, code) {
        const result = {};
        const kid = this.extractKid(idToken);
        if (!kid) {
            result.extract_kid = false;
            return [false, result];
        }
        result.extract_kid = true;
        const payload = this.verifySignature(idToken, kid, publicKeysResponse);
        if (!payload) {
            result.valid_signature = false;
            return [false, result];
        }
        result.valid_signature = true;
        if (payload.iss === ISS) {
            result.valid_iss = true;
        }
        else {
            this.logger.debug(`${LogTitle} - invalid iss`, {
                expected: ISS,
                actual: payload.iss,
            });
            result.valid_iss = false;
        }
        if (payload.aud.includes(clientId)) {
            result.valid_aud = true;
        }
        else {
            this.logger.debug(`${LogTitle} - aud is not contained the Client ID`, {
                target: clientId,
                actual: payload.aud,
            });
            result.valid_aud = false;
        }
        if (nonce) {
            if (payload.nonce === nonce) {
                result.valid_nonce = true;
            }
            else {
                this.logger.debug(`${LogTitle} - invalid nonce`, {
                    expected: nonce,
                    actual: payload.nonce,
                });
                result.valid_nonce = false;
            }
        }
        if (accessToken) {
            if (this.verifyATHash(payload, accessToken)) {
                result.valid_at_hash = true;
            }
            else {
                result.valid_at_hash = false;
            }
        }
        if (code) {
            if (this.verifyCHash(payload, code)) {
                result.valid_c_hash = true;
            }
            else {
                result.valid_c_hash = false;
            }
        }
        const currentTimeStamp = Date.now() / 1000;
        if (payload.exp > currentTimeStamp) {
            result.not_expired = true;
        }
        else {
            this.logger.debug(`${LogTitle} - expired`, {
                current: currentTimeStamp,
                exp: payload.exp,
            });
            result.not_expired = false;
        }
        let isValid = true;
        Object.values(result).forEach((value) => {
            if (value === false) {
                isValid = false;
                return;
            }
        });
        return [isValid, result];
    }
    extractKid(idToken) {
        try {
            const [rawHeader] = idToken.split(".");
            const decodedHeader = base64url_1.default.decode(rawHeader);
            return JSON.parse(decodedHeader).kid;
        }
        catch (error) {
            return undefined;
        }
    }
    verifySignature(idToken, kid, publicKeysResponse) {
        try {
            return jsonwebtoken_1.default.verify(idToken, publicKeysResponse[kid], {
                ignoreExpiration: true,
            });
        }
        catch (error) {
            return undefined;
        }
    }
    verifyATHash(payload, accessToken) {
        try {
            const expectedHash = this.createHash(accessToken);
            if (payload.at_hash === expectedHash) {
                return true;
            }
            else {
                this.logger.debug(`${LogTitle} - invalid at_hash`, {
                    expected: expectedHash,
                    actual: payload.at_hash,
                });
                return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    verifyCHash(payload, code) {
        try {
            const expectedHash = this.createHash(code);
            if (payload.c_hash === expectedHash) {
                return true;
            }
            else {
                this.logger.debug(`${LogTitle} - invalid c_hash`, {
                    expected: expectedHash,
                    actual: payload.c_hash,
                });
                return false;
            }
        }
        catch (error) {
            return false;
        }
    }
    createHash(value) {
        const hash = (0, crypto_1.createHash)("sha256").update(value).digest();
        const halfOfHash = hash.slice(0, hash.length / 2);
        return base64url_1.default.encode(halfOfHash);
    }
};
IdTokenVerifier = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __metadata("design:paramtypes", [logger_1.Logger])
], IdTokenVerifier);
exports.IdTokenVerifier = IdTokenVerifier;
//# sourceMappingURL=idtoken_verifier.js.map