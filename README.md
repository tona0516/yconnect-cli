# yconnect-cli

## Overview
CLI for Yahoo! Identity Federation. (UNOFFICIAL)
https://developer.yahoo.co.jp/yconnect/v2/
## Getting start
1. Install asdf (ref. https://asdf-vm.com/).
1. `$ asdf plugin add nodejs && asdf install nodejs lts && corepack enable && asdf reshim nodejs`
1. `$ yarn`
1. `$ yarn run run -v`

## Usage
1. Create Client ID (ref. https://e.developer.yahoo.co.jp/register).
1. Add http://localhost:3000/front to callback URL of the Client ID above.
2. See the following examples and details by `$ yarn run run help`.

## Examples
### Client-side Client ID
- Get tokens
  - simple
    - `$ yarn run run auth -c <Client ID>`
  - with options
    - `$ yarn run run auth -c <Client ID> --scope openid profile address`
- Get userinfo by access token
  - `$ yarn run run userinfo <Access Token>`
- Refresh access token
  - `$ yarn run run refresh -c <Client ID> -r <Refresh Token>`

### Server-side Client ID
Add `--client-secret <Client Secret>` in the case of `auth` and `refresh` subcommand.

## Dependencies
- Node.js
  - 18.12.1 or later
