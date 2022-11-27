import "reflect-metadata";
import { Logger } from "./logger";
import { IdTokenVerifier } from "./idtoken_verifier";
import base64url from "base64url";
import jwt from "jsonwebtoken";
import fs from "fs";
import { createHash } from "crypto";

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

let idtokenVerifier: IdTokenVerifier;
let privateKey: string;
let publicKeyResponse: { any_kid: string };

beforeEach(() => {
  const logger = new Logger();
  idtokenVerifier = new IdTokenVerifier(logger);
  privateKey = fs.readFileSync("testkey/private.key", "utf-8");
  const publicKey = fs.readFileSync("testkey/public.key", "utf-8");
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

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    "any_nonce",
    publicKeyResponse
  );

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

  const [isValid, result] = idtokenVerifier.verify(
    idtoken,
    "any_client_id",
    "any_nonce",
    publicKeyResponse,
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
    "any_nonce",
    publicKeyResponse,
    "any_access_token",
    "any_code"
  );

  expect(isValid).toBe(false);
  expect(result).toMatchObject({
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
    "any_nonce",
    publicKeyResponse,
    "any_access_token",
    "any_code"
  );

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
])(
  "veriry() error invalid payload - %s",
  (overWritternPayload, overwrittenExpected) => {
    const payload = { ...normalPayload, ...overWritternPayload };

    const idtoken = sign(payload, privateKey);

    const [isValid, result] = idtokenVerifier.verify(
      idtoken,
      "any_client_id",
      "any_nonce",
      publicKeyResponse,
      "any_access_token",
      "any_code"
    );

    expect(isValid).toBe(false);
    expect(result).toStrictEqual({ ...normalResult, ...overwrittenExpected });
  }
);
