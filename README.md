# yconnect-cli
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/tona0516/yconnect-cli/Build)
![GitHub](https://img.shields.io/github/license/tona0516/yconnect-cli)
![npm](https://img.shields.io/npm/v/@tona0516/yconnect-cli)

## Overview
CLI for Yahoo! Identity Federation. (UNOFFICIAL)
https://developer.yahoo.co.jp/yconnect/v2/
## Getting start
```
$ npm i -g @tona0516/yconnect-cli
$ yconnect-cli
```
## Preparation
1. Create Client ID (ref. https://e.developer.yahoo.co.jp/register).
1. Add http://localhost:3000/front to callback URL of the Client ID above.

## Examples
### Client-side Client ID
- Get tokens
  - simple
    - `$ yconnect-cli auth -c <Client ID>`
  - with options
    - `$ yconnect-cli auth -c <Client ID> --scope openid profile address`
- Get userinfo by access token
  - `$ yconnect-cli userinfo <Access Token>`
- Refresh access token
  - `$ yconnect-cli refresh -c <Client ID> -r <Refresh Token>`

### Server-side Client ID
Add `--client-secret <Client Secret>` in the case of `auth` and `refresh` subcommand.

## Dependencies
- Node.js
  - 18.12.1 or later
