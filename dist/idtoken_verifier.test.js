"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = require("./logger");
const idtoken_verifier_1 = require("./idtoken_verifier");
const base64url_1 = __importDefault(require("base64url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const sign = (payload, privateKey) => {
    return jsonwebtoken_1.default.sign(payload, privateKey, {
        algorithm: "RS256",
        keyid: "any_kid",
    });
};
const hash = (value) => {
    const hash = (0, crypto_1.createHash)("sha256").update(value).digest();
    const halfOfHash = hash.slice(0, hash.length / 2);
    return base64url_1.default.encode(halfOfHash);
};
const normalPayload = {
    iss: "https://auth.login.yahoo.co.jp/yconnect/v2",
    sub: "any_sub",
    aud: ["any_client_id"],
    exp: 1893423600,
    iat: 1640962800,
    nonce: "any_nonce",
    amr: ["pwd"],
    at_hash: hash("any_access_token"),
    c_hash: hash("any_code"),
};
const normalResult = {
    extract_kid: true,
    valid_signature: true,
    valid_iss: true,
    valid_aud: true,
    valid_nonce: true,
    valid_at_hash: true,
    valid_c_hash: true,
    not_expired: true,
};
let idtokenVerifier;
let privateKey;
let publicKeyResponse;
beforeEach(() => {
    const logger = new logger_1.Logger();
    idtokenVerifier = new idtoken_verifier_1.IdTokenVerifier(logger);
    privateKey = fs_1.default.readFileSync("testkey/private.key", "utf-8");
    const publicKey = fs_1.default.readFileSync("testkey/public.key", "utf-8");
    publicKeyResponse = { any_kid: publicKey };
});
afterEach(() => {
    jest.restoreAllMocks();
});
test("verify() minimum", () => {
    const payload = {
        iss: "https://auth.login.yahoo.co.jp/yconnect/v2",
        sub: "any_sub",
        aud: ["any_client_id"],
        exp: 1893423600,
        iat: 1640962800,
        nonce: "any_nonce",
    };
    const idtoken = sign(payload, privateKey);
    const [isValid, result] = idtokenVerifier.verify(idtoken, "any_client_id", "any_nonce", publicKeyResponse);
    expect(isValid).toBe(true);
    expect(result).toMatchObject({
        extract_kid: true,
        valid_signature: true,
        valid_iss: true,
        valid_aud: true,
        valid_nonce: true,
        not_expired: true,
    });
});
test("verify() full", () => {
    const idtoken = sign(normalPayload, privateKey);
    const [isValid, result] = idtokenVerifier.verify(idtoken, "any_client_id", "any_nonce", publicKeyResponse, "any_access_token", "any_code");
    expect(isValid).toBe(true);
    expect(result).toStrictEqual(normalResult);
});
test("veriry() error not found kid", () => {
    const idtoken = jsonwebtoken_1.default.sign(normalPayload, privateKey, { algorithm: "RS256" });
    const [isValid, result] = idtokenVerifier.verify(idtoken, "any_client_id", "any_nonce", publicKeyResponse, "any_access_token", "any_code");
    expect(isValid).toBe(false);
    expect(result).toMatchObject({
        extract_kid: false,
    });
});
test("veriry() error another private key", () => {
    const privateKey = fs_1.default.readFileSync("testkey/another_private.key", "utf-8");
    const publicKey = fs_1.default.readFileSync("testkey/public.key", "utf-8");
    const publicKeyResponse = { any_kid: publicKey };
    const idtoken = sign(normalPayload, privateKey);
    const [isValid, result] = idtokenVerifier.verify(idtoken, "any_client_id", "any_nonce", publicKeyResponse, "any_access_token", "any_code");
    expect(isValid).toBe(false);
    expect(result).toMatchObject({
        extract_kid: true,
        valid_signature: false,
    });
});
test.each([
    [{ iss: "https://accounts.google.com" }, { valid_iss: false }],
    [{ aud: "invalid_aud" }, { valid_aud: false }],
    [{ nonce: "invalid_nonce" }, { valid_nonce: false }],
    [{ at_hash: hash("invalid_access_token") }, { valid_at_hash: false }],
    [{ c_hash: hash("invalid_code") }, { valid_c_hash: false }],
    [{ exp: 1640962800 }, { not_expired: false }],
])("veriry() error invalid payload - %s", (overWritternPayload, overwrittenExpected) => {
    const payload = { ...normalPayload, ...overWritternPayload };
    const idtoken = sign(payload, privateKey);
    const [isValid, result] = idtokenVerifier.verify(idtoken, "any_client_id", "any_nonce", publicKeyResponse, "any_access_token", "any_code");
    expect(isValid).toBe(false);
    expect(result).toStrictEqual({ ...normalResult, ...overwrittenExpected });
});
//# sourceMappingURL=idtoken_verifier.test.js.map