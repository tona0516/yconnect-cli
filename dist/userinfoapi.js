"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserinfoApi = void 0;
const axios_1 = __importDefault(require("axios"));
const tsyringe_1 = require("tsyringe");
const logger_1 = require("./logger");
const URL = {
    BASE: "https://userinfo.yahooapis.jp",
    ATTRIBUTE: "yconnect/v2/attribute",
};
let UserinfoApi = class UserinfoApi {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async get(accessToken) {
        const searchParams = new URLSearchParams();
        searchParams.append("access_token", accessToken);
        return await axios_1.default
            .get(`${URL.BASE}/${URL.ATTRIBUTE}?access_token=${accessToken}`)
            .then((response) => {
            this.logger.debug("UserInfo Endpoint Response", response);
            return response.data;
        })
            .catch((error) => {
            this.logger.debug("UserInfo Endpoint Response", error);
            return error.response.data;
        });
    }
};
UserinfoApi = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __metadata("design:paramtypes", [logger_1.Logger])
], UserinfoApi);
exports.UserinfoApi = UserinfoApi;
//# sourceMappingURL=userinfoapi.js.map