"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = require("./logger");
const yconnect_1 = require("./yconnect");
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const axios_1 = __importDefault(require("axios"));
jest.mock("./logger");
const issueNormalResponse = {
    access_token: "123",
    token_type: "Bearer",
    refresh_token: "456",
    expires_in: 3600,
    id_token: "789",
};
const refreshNormalResponse = {
    access_token: "123",
    token_type: "Bearer",
    expires_in: 3600,
};
const errorResponse = {
    error: "any_error",
    error_description: "any_description",
    error_code: 12345,
};
afterEach(() => {
    jest.restoreAllMocks();
});
test("generateAuthzURL() minimum params", () => {
    const authzParam = {
        responseType: ["code"],
        clientId: "dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-",
        redirectUri: "http://example.jp",
        scope: ["openid"],
    };
    const mockLogger = new logger_1.Logger();
    const yconnect = new yconnect_1.YConnect(mockLogger);
    const actual = new URL(yconnect.generateAuthzURL(authzParam));
    expect(actual.origin).toBe("https://auth.login.yahoo.co.jp");
    expect(actual.pathname).toBe("/yconnect/v2/authorization");
    expect(actual.searchParams.get("response_type")).toBe("code");
    expect(actual.searchParams.get("client_id")).toBe("dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-");
    expect(actual.searchParams.get("redirect_uri")).toBe("http://example.jp");
    expect(actual.searchParams.get("scope")).toBe("openid");
});
test("generateAuthzURL() full params", () => {
    const authzParam = {
        responseType: ["code", "id_token", "token"],
        clientId: "dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-",
        redirectUri: "http://example.jp",
        scope: ["openid", "profile", "address"],
        bail: true,
        state: "12345",
        nonce: "abcde",
        display: "page",
        prompt: ["login", "consent"],
        maxAge: 3600,
        codeChallenge: "01234567890123456789012345678901234567890123",
        codeChallengeMethod: "plain",
    };
    const mockLogger = new logger_1.Logger();
    const yconnect = new yconnect_1.YConnect(mockLogger);
    const actual = new URL(yconnect.generateAuthzURL(authzParam));
    expect(actual.origin).toBe("https://auth.login.yahoo.co.jp");
    expect(actual.pathname).toBe("/yconnect/v2/authorization");
    expect(actual.searchParams.get("response_type")).toBe("code id_token token");
    expect(actual.searchParams.get("client_id")).toBe("dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-");
    expect(actual.searchParams.get("redirect_uri")).toBe("http://example.jp");
    expect(actual.searchParams.get("scope")).toBe("openid profile address");
    expect(actual.searchParams.get("bail")).toBe("1");
    expect(actual.searchParams.get("state")).toBe("12345");
    expect(actual.searchParams.get("nonce")).toBe("abcde");
    expect(actual.searchParams.get("display")).toBe("page");
    expect(actual.searchParams.get("prompt")).toBe("login consent");
    expect(actual.searchParams.get("max_age")).toBe("3600");
    expect(actual.searchParams.get("code_challenge")).toBe("01234567890123456789012345678901234567890123");
    expect(actual.searchParams.get("code_challenge_method")).toBe("plain");
});
test.each([
    [200, issueNormalResponse],
    [400, errorResponse],
    [500, errorResponse],
])("issueToken() status_code=%i", async (statusCode, expectedResponse) => {
    const issueTokenParam = {
        clientId: "dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-",
        redirectUri: "http://example.jp",
        code: "123",
        clientSecret: "456",
        codeVerifier: "789",
    };
    const mockLogger = new logger_1.Logger();
    const yconnect = new yconnect_1.YConnect(mockLogger);
    const axiosMock = new axios_mock_adapter_1.default(axios_1.default);
    axiosMock
        .onPost("https://auth.login.yahoo.co.jp/yconnect/v2/token")
        .reply(statusCode, expectedResponse);
    const axiosSpy = jest.spyOn(axios_1.default, "post");
    const actualResponse = await yconnect.issueToken(issueTokenParam);
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toBeDefined();
});
test.each([
    [200, refreshNormalResponse],
    [400, errorResponse],
    [500, errorResponse],
])("refreshToken() status_code=%i", async (statusCode, expectedResponse) => {
    const issueTokenParam = {
        clientId: "dj00aiZpPWdSem5VY0hCWGdTaCZzPWNvbnN1bWVyc2VjcmV0Jng9MTg-",
        refreshToken: "123",
        clientSecret: "456",
    };
    const mockLogger = new logger_1.Logger();
    const yconnect = new yconnect_1.YConnect(mockLogger);
    const axiosMock = new axios_mock_adapter_1.default(axios_1.default);
    axiosMock
        .onPost("https://auth.login.yahoo.co.jp/yconnect/v2/token")
        .reply(statusCode, expectedResponse);
    const axiosSpy = jest.spyOn(axios_1.default, "post");
    const actualResponse = await yconnect.refreshToken(issueTokenParam);
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toBeDefined();
});
//# sourceMappingURL=yconnect.test.js.map