import "reflect-metadata";
import { Logger } from "./logger";
import { IdTokenVerifier } from "./idtoken_verifier";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import fs from "fs";
import { createHash } from "crypto";
import { Clock } from "./clock";

jest.mock("./clock");

const sign = (payload: object, privateKey: string): string => {
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    keyid: "any_kid",
  });
};

const hash = (value: string): string => {
  const hash = createHash("sha256").update(value).digest();
  const halfOfHash = hash.slice(0, hash.length / 2);
  return base64url.encode(halfOfHash);
};

const unixtime = (
  year: number,
  monthIndex: number,
  date: number,
  hours: number,
  minutes: number,
  seconds: number
): number => {
  return (
    new Date(year, monthIndex, date, hours, minutes, seconds).getTime() / 1000
  );
};

const normalPayload = {
  iss: "https://auth.login.yahoo.co.jp/yconnect/v2",
  sub: "any_sub",
  aud: ["any_client_id"],
  exp: unixtime(2030, 1, 1, 0, 0, 0),
  iat: unixtime(2022, 1, 1, 0, 0, 0),
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

let clock: Clock;
let idtokenVerifier: IdTokenVerifier;
let privateKey: string;
let publicKeyResponse: { any_kid: string };

beforeEach(() => {
  const logger = new Logger();
  clock = new Clock();
  idtokenVerifier = new IdTokenVerifier(logger, clock);
  privateKey = fs.readFileSync("testkey/private.key", "utf-8");
  const publicKey = fs.readFileSync("testkey/public.key", "utf-8");
  publicKeyResponse = { any_kid: publicKey };
  jest
    .spyOn(clock, "currentUnixtime")
    .mockImplementation(() => unixtime(2022, 1, 1, 0, 0, 1));
});

afterEach(() => {
  jest.restoreAllMocks();
});

test("verify() minimum", () => {
  const payload = {
    iss: "https://auth.login.yahoo.co.jp/yconnect/v2",
    sub: "any_sub",
    aud: ["any_client_id"],
    exp: unixtime(2030, 1, 1, 0, 0, 0),
    iat: unixtime(2022, 1, 1, 0, 0, 0),
  };

  const idtoken = sign(payload, privateKey);

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    publicKeyResponse
  );

  expect(isValid).toBe(true);
  expect(result).toMatchObject({
    extract_kid: true,
    valid_signature: true,
    valid_iss: true,
    valid_aud: true,
    not_expired: true,
  });
});

test("verify() full", () => {
  const idtoken = sign(normalPayload, privateKey);

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    publicKeyResponse,
    "any_nonce",
    "any_access_token",
    "any_code"
  );

  expect(isValid).toBe(true);
  expect(result).toStrictEqual(normalResult);
});

test("veriry() error not found kid", () => {
  const idtoken = jwt.sign(normalPayload, privateKey, { algorithm: "RS256" });

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    publicKeyResponse,
    "any_nonce",
    "any_access_token",
    "any_code"
  );

  expect(isValid).toBe(false);
  expect(result).toStrictEqual({
    extract_kid: false,
  });
});

test("veriry() error another private key", () => {
  const privateKey = fs.readFileSync("testkey/another_private.key", "utf-8");
  const publicKey = fs.readFileSync("testkey/public.key", "utf-8");
  const publicKeyResponse = { any_kid: publicKey };

  const idtoken = sign(normalPayload, privateKey);

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    publicKeyResponse,
    "any_nonce",
    "any_access_token",
    "any_code"
  );

  expect(isValid).toBe(false);
  expect(result).toStrictEqual({
    extract_kid: true,
    valid_signature: false,
  });
});

test.each([
  [
    { iss: "https://accounts.google.com" },
    {
      valid_iss: false,
      iss_error_detail: {
        actual: "https://accounts.google.com",
        expected: "https://auth.login.yahoo.co.jp/yconnect/v2",
        message: "invalid iss",
      },
    },
  ],
  [
    { aud: "invalid_aud" },
    {
      valid_aud: false,
      aud_error_detail: {
        actual: "invalid_aud",
        expected: "any_client_id",
        message: "aud is not contained the Client ID",
      },
    },
  ],
  [
    { nonce: "invalid_nonce" },
    {
      valid_nonce: false,
      nonce_error_detail: {
        actual: "invalid_nonce",
        expected: "any_nonce",
        message: "invalid nonce",
      },
    },
  ],
  [
    { at_hash: hash("invalid_access_token") },
    {
      valid_at_hash: false,
      at_hash_error_detail: {
        actual: "4Qhe0Tgef7dkZgjaOBn3NQ",
        expected: "5YxVQn1cpQRqBxKe3_4Eyg",
        message: "invalid at_hash",
      },
    },
  ],
  [
    { c_hash: hash("invalid_code") },
    {
      valid_c_hash: false,
      c_hash_error_detail: {
        actual: "5YxVQn1cpQRqBxKe3_4Eyg",
        expected: "Dy9PSuHTTTPBC5gwnhnnZg",
        message: "invalid c_hash",
      },
    },
  ],
  [
    { exp: unixtime(2022, 1, 1, 0, 0, 0) },
    {
      not_expired: false,
      expire_error_detail: {
        current: unixtime(2022, 1, 1, 0, 0, 1),
        expiration: unixtime(2022, 1, 1, 0, 0, 0),
        message: "expired",
      },
    },
  ],
])(
  "veriry() error invalid payload - %s",
  (overWritternPayload, overwrittenExpected) => {
    const payload = { ...normalPayload, ...overWritternPayload };

    const idtoken = sign(payload, privateKey);

    const [isValid, result] = idtokenVerifier.verify(
      idtoken,
      "any_client_id",
      publicKeyResponse,
      "any_nonce",
      "any_access_token",
      "any_code"
    );

    expect(isValid).toBe(false);
    expect(result).toStrictEqual({
      ...normalResult,
      ...overwrittenExpected,
    });
  }
);
