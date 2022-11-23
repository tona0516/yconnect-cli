"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_1 = require("./logger");
const userinfoapi_1 = require("./userinfoapi");
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const axios_1 = __importDefault(require("axios"));
jest.mock("./logger");
const normalResponee = {
    sub: "any_sub",
};
const errorResponse = {
    Error: {
        Message: "any_message",
    },
};
afterEach(() => {
    jest.restoreAllMocks();
});
test.each([
    [200, normalResponee],
    [400, errorResponse],
    [500, errorResponse],
])("get() status_code=%i", async (statusCode, expectedResponse) => {
    const mockLogger = new logger_1.Logger();
    const userinfoApi = new userinfoapi_1.UserinfoApi(mockLogger);
    const axiosMock = new axios_mock_adapter_1.default(axios_1.default);
    axiosMock
        .onGet(/^https:\/\/userinfo.yahooapis.jp\/yconnect\/v2\/attribute\?access_token=/)
        .reply(statusCode, expectedResponse);
    const axiosSpy = jest.spyOn(axios_1.default, "get");
    const actualResponse = await userinfoApi.get("any_access_token");
    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toBeDefined();
});
//# sourceMappingURL=userinfoapi.test.js.map