import "reflect-metadata";
import { Logger } from "./logger";
import { UserinfoApi } from "./userinfoapi";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

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
  const mockLogger = new Logger();
  const userinfoApi = new UserinfoApi(mockLogger);

  const axiosMock = new MockAdapter(axios);
  axiosMock
    .onGet(
      /^https:\/\/userinfo.yahooapis.jp\/yconnect\/v2\/attribute\?access_token=/
    )
    .reply(statusCode, expectedResponse);
  const axiosSpy = jest.spyOn(axios, "get");

  const actualResponse = await userinfoApi.get("any_access_token");
  expect(axiosSpy).toHaveBeenCalledTimes(1);
  expect(actualResponse).toBeDefined();
});
