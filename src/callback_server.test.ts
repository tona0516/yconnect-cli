import "reflect-metadata";
import axios from "axios";
import { Logger } from "./logger";
import "reflect-metadata";
import { CallbackServer } from "./callback_server";

let callbackServer: CallbackServer;

beforeEach(() => {
  const logger = new Logger();
  callbackServer = new CallbackServer(logger);
});

afterEach(() => {
  callbackServer.close();
  jest.restoreAllMocks();
});

test("create() front", async () => {
  callbackServer.create();
  const response = await axios.get(`http://localhost:3000/front`);
  expect(response.status).toBe(200);
});

test.each([
  ["http://localhost:3000/front?"],
  ["http://localhost:3000/front?code=123"],
  ["http://localhost:3000/front#code=123&id_token=456"],
])("create() back", async (expected) => {
  const promise = callbackServer.create();
  const response = await axios.get(
    `http://localhost:3000/back?callback_url=${encodeURIComponent(expected)}`
  );
  expect(response.status).toBe(200);
  const callbackUrl = await promise;
  expect(callbackUrl).toBe(expected);
});
