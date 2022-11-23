"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
require("reflect-metadata");
const callback_server_1 = require("./callback_server");
let callbackServer;
beforeEach(() => {
    callbackServer = new callback_server_1.CallbackServer();
});
afterEach(() => {
    callbackServer.close();
    jest.restoreAllMocks();
});
test("create() front", async () => {
    callbackServer.create();
    const response = await axios_1.default.get(`http://localhost:3000/front`);
    expect(response.status).toBe(200);
});
test.each([
    ["http://localhost:3000/front?"],
    ["http://localhost:3000/front?code=123"],
    ["http://localhost:3000/front#code=123&id_token=456"],
])("create() back", async (expected) => {
    const promise = callbackServer.create();
    const response = await axios_1.default.get(`http://localhost:3000/back?callback_url=${encodeURIComponent(expected)}`);
    expect(response.status).toBe(200);
    const callbackUrl = await promise;
    expect(callbackUrl).toBe(expected);
});
//# sourceMappingURL=callback_server.test.js.map