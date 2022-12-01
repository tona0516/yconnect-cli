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
const clock_1 = require("./clock");
const ISS = "https://auth.login.yahoo.co.jp/yconnect/v2";
let IdTokenVerifier = class IdTokenVerifier {
    logger;
    clock;
    constructor(logger, clock) {
        this.logger = logger;
        this.clock = clock;
    }
    verify(idToken, clientId, publicKeysResponse, nonce, accessToken, code) {
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
            result.valid_iss = false;
            result.iss_error_detail = {
                message: "invalid iss",
                expected: ISS,
                actual: payload.iss,
            };
        }
        if (payload.aud.includes(clientId)) {
            result.valid_aud = true;
        }
        else {
            result.valid_aud = false;
            result.aud_error_detail = {
                message: "aud is not contained the Client ID",
                expected: clientId,
                actual: payload.aud,
            };
        }
        if (nonce) {
            if (payload.nonce === nonce) {
                result.valid_nonce = true;
            }
            else {
                result.valid_nonce = false;
                result.nonce_error_detail = {
                    message: "invalid nonce",
                    expected: nonce,
                    actual: payload.nonce,
                };
            }
        }
        if (accessToken) {
            const [isValid, expected] = this.verifyHash(accessToken, payload.at_hash);
            if (isValid) {
                result.valid_at_hash = true;
            }
            else {
                result.valid_at_hash = false;
                result.at_hash_error_detail = {
                    message: "invalid at_hash",
                    expected: expected,
                    actual: payload.at_hash,
                };
            }
        }
        if (code) {
            const [isValid, expected] = this.verifyHash(code, payload.c_hash);
            if (isValid) {
                result.valid_c_hash = true;
            }
            else {
                result.valid_c_hash = false;
                result.c_hash_error_detail = {
                    message: "invalid c_hash",
                    expected: expected,
                    actual: payload.at_hash,
                };
            }
        }
        const current = this.clock.currentUnixtime();
        if (payload.exp > current) {
            result.not_expired = true;
        }
        else {
            result.not_expired = false;
            result.expire_error_detail = {
                message: "expired",
                current: current,
                expiration: payload.exp,
            };
        }
        if (Object.values(result).filter((value) => value === false).length === 0) {
            return [true, result];
        }
        else {
            return [false, result];
        }
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
    verifyHash(value, hashInPayload) {
        const hash = (0, crypto_1.createHash)("sha256").update(value).digest();
        const halfOfHash = Uint8Array.from(hash).slice(0, hash.length / 2);
        const expectedHash = base64url_1.default.encode(Buffer.from(halfOfHash));
        return [hashInPayload === expectedHash, expectedHash];
    }
};
IdTokenVerifier = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __param(1, (0, tsyringe_1.inject)("Clock")),
    __metadata("design:paramtypes", [logger_1.Logger,
        clock_1.Clock])
], IdTokenVerifier);
exports.IdTokenVerifier = IdTokenVerifier;
//# sourceMappingURL=idtoken_verifier.js.map