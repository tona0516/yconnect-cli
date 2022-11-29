import "reflect-metadata";
import { Logger } from "./logger";
import { UserinfoApi } from "./userinfoapi";
import { CallbackServer } from "./callback_server";
import { YConnect } from "./yconnect";
import { Usecase } from "./usecase";
import { IdTokenVerifier } from "./idtoken_verifier";

jest.mock("./logger");
jest.mock("./userinfoapi");
jest.mock("./yconnect");
jest.mock("./callback_server");
jest.mock("./idtoken_verifier");
jest.mock("open");

let logger: Logger;
let callbackServer: CallbackServer;
let yconnect: YConnect;
let userinfoApi: UserinfoApi;
let usecase: Usecase;
let idtokenVerifier: IdTokenVerifier;

beforeEach(() => {
  logger = new Logger();
  callbackServer = new CallbackServer(logger);
  yconnect = new YConnect(logger);
  userinfoApi = new UserinfoApi(logger);
  idtokenVerifier = new IdTokenVerifier(logger);
  usecase = new Usecase(
    logger,
    callbackServer,
    yconnect,
    userinfoApi,
    idtokenVerifier
  );
  jest.spyOn(logger, "info").mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("authorize() authorization code flow", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve("http://localhost:3000/front?code=123")
    );
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

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    2,
    "Token Response",
    expect.anything()
  );
});

test("authorize() implicit flow", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve(
        "http://localhost:3000/front?id_token=123&access_token=456"
      )
    );

  const options = {
    responseType: ["token", "id_token"],
    clientId: "any_client_id",
    redirectUri: "any_redirect_uri",
    scope: ["openid"],
    debug: false,
  };
  await usecase.authorize(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
});

test("authorize() hybrid code flow", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve(
        "http://localhost:3000/front#code=123&access_token=456&id_token=789"
      )
    );
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

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    2,
    "Token Response",
    expect.anything()
  );
});

test("authorize() authz error", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve(
        "http://localhost:3000/front?error=any_error&error_description=any_error_description&error_code=123"
      )
    );

  const options = {
    responseType: ["code"],
    clientId: "any_client_id",
    redirectUri: "any_redirect_uri",
    scope: ["openid"],
    debug: false,
  };
  await usecase.authorize(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
});

test("authorize() token error", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve("http://localhost:3000/front?code=123")
    );
  jest.spyOn(yconnect, "issueToken").mockImplementation(() => {
    return Promise.resolve({
      error: "any_error",
      error_description: "any_description",
      error_code: 0,
    });
  });

  const options = {
    responseType: ["code"],
    clientId: "any_client_id",
    redirectUri: "any_redirect_uri",
    scope: ["openid"],
    debug: false,
  };
  await usecase.authorize(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    2,
    "Token Response",
    expect.anything()
  );
});

test("authorize() no code", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve("http://localhost:3000/front?state=123")
    );

  const options = {
    responseType: ["code"],
    clientId: "any_client_id",
    redirectUri: "any_redirect_uri",
    scope: ["openid"],
    debug: false,
  };
  await usecase.authorize(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
});

test("authorize() verify", async () => {
  jest
    .spyOn(callbackServer, "create")
    .mockImplementation(() =>
      Promise.resolve(
        "http://localhost:3000/front#code=123&access_token=456&id_token=789"
      )
    );
  jest.spyOn(idtokenVerifier, "verify").mockImplementation(() => {
    return [true, {}];
  });
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
    verify: true,
  };
  await usecase.authorize(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Authorization Response",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    2,
    "ID Token Verification",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    3,
    "Token Response",
    expect.anything()
  );
  expect(logger.info).toHaveBeenNthCalledWith(
    4,
    "ID Token Verification",
    expect.anything()
  );
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

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Token Response",
    expect.anything()
  );
});

test("fetchUserinfo()", async () => {
  jest.spyOn(userinfoApi, "get").mockImplementation(() => {
    return Promise.resolve({});
  });

  const options = {
    accessToken: "any_access_token",
  };
  await usecase.fetchUserinfo(options);

  expect(logger.info).toHaveBeenNthCalledWith(
    1,
    "Userinfo Response",
    expect.anything()
  );
});
