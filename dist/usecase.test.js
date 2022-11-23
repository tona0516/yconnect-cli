"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = require("./logger");
const userinfoapi_1 = require("./userinfoapi");
const callback_server_1 = require("./callback_server");
const yconnect_1 = require("./yconnect");
const usecase_1 = require("./usecase");
jest.mock("./logger");
jest.mock("./userinfoapi");
jest.mock("./yconnect");
jest.mock("./callback_server");
jest.mock("open");
let logger;
let callbackServer;
let yconnect;
let userinfoApi;
let usecase;
beforeEach(() => {
    logger = new logger_1.Logger();
    callbackServer = new callback_server_1.CallbackServer();
    yconnect = new yconnect_1.YConnect(logger);
    userinfoApi = new userinfoapi_1.UserinfoApi(logger);
    usecase = new usecase_1.Usecase(logger, callbackServer, yconnect, userinfoApi);
    jest.spyOn(logger, "info").mockImplementation();
});
afterEach(() => {
    jest.restoreAllMocks();
});
test("authorize() authorization code flow", async () => {
    jest
        .spyOn(callbackServer, "create")
        .mockImplementation(() => Promise.resolve("http://localhost:3000/front?code=123"));
    jest.spyOn(yconnect, "issueToken").mockImplementation(() => {
        return Promise.resolve({});
    });
    const options = {
        responseType: ["code"],
        clientId: "any_client_id",
        redirectUri: "any_redirect_uri",
        scope: ["openid"],
        debug: false,
    };
    await usecase.authorize(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Authorization Response", expect.anything());
    expect(logger.info).toHaveBeenNthCalledWith(2, "Token Response", expect.anything());
});
test("authorize() implicit flow", async () => {
    jest
        .spyOn(callbackServer, "create")
        .mockImplementation(() => Promise.resolve("http://localhost:3000/front?id_token=123&access_token=456"));
    const options = {
        responseType: ["token", "id_token"],
        clientId: "any_client_id",
        redirectUri: "any_redirect_uri",
        scope: ["openid"],
        debug: false,
    };
    await usecase.authorize(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Authorization Response", expect.anything());
});
test("authorize() hybrid code flow", async () => {
    jest
        .spyOn(callbackServer, "create")
        .mockImplementation(() => Promise.resolve("http://localhost:3000/front#code=123&access_token=456&id_token=789"));
    jest.spyOn(yconnect, "issueToken").mockImplementation(() => {
        return Promise.resolve({});
    });
    const options = {
        responseType: ["code", "token", "id_token"],
        clientId: "any_client_id",
        redirectUri: "any_redirect_uri",
        scope: ["openid"],
        nonce: "any_nonce",
        debug: false,
    };
    await usecase.authorize(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Authorization Response", expect.anything());
    expect(logger.info).toHaveBeenNthCalledWith(2, "Token Response", expect.anything());
});
test("authorize() error", async () => {
    jest
        .spyOn(callbackServer, "create")
        .mockImplementation(() => Promise.resolve("http://localhost:3000/front?error=any_error&error_description=any_error_description&error_code=123"));
    const options = {
        responseType: ["code"],
        clientId: "any_client_id",
        redirectUri: "any_redirect_uri",
        scope: ["openid"],
        debug: false,
    };
    await usecase.authorize(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Authorization Response", expect.anything());
});
test("authorize() no code", async () => {
    jest
        .spyOn(callbackServer, "create")
        .mockImplementation(() => Promise.resolve("http://localhost:3000/front?state=123"));
    const options = {
        responseType: ["code"],
        clientId: "any_client_id",
        redirectUri: "any_redirect_uri",
        scope: ["openid"],
        debug: false,
    };
    await usecase.authorize(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Authorization Response", expect.anything());
});
test("refresh()", async () => {
    jest.spyOn(yconnect, "refreshToken").mockImplementation(() => {
        return Promise.resolve({});
    });
    const options = {
        clientId: "any_client_id",
        refreshToken: "any_refrsh_token",
        clientSecret: "any_client_secret",
    };
    await usecase.refresh(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Token Response", expect.anything());
});
test("fetchUserinfo()", async () => {
    jest.spyOn(userinfoApi, "get").mockImplementation(() => {
        return Promise.resolve({});
    });
    const options = {
        accessToken: "any_access_token",
    };
    await usecase.fetchUserinfo(options);
    expect(logger.info).toHaveBeenNthCalledWith(1, "Userinfo Response", expect.anything());
});
//# sourceMappingURL=usecase.test.js.map