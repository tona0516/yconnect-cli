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
exports.CallbackServer = void 0;
const url_1 = __importDefault(require("url"));
const express_1 = __importDefault(require("express"));
const tsyringe_1 = require("tsyringe");
const logger_1 = require("./logger");
let CallbackServer = class CallbackServer {
    logger;
    server;
    constructor(logger) {
        this.logger = logger;
    }
    async create(frontendPath = "front", backendPath = "back", port = 3000) {
        return new Promise((resolve) => {
            const express = (0, express_1.default)();
            express.set("view engine", "ejs");
            express.set("views", `${__dirname}/../view`);
            express.get(`/${frontendPath}`, (req, res) => {
                res.render("./index.ejs", {
                    port: port,
                    backendPath: backendPath,
                });
            });
            express.get(`/${backendPath}`, (req, res) => {
                res.sendStatus(200);
                const callbackUrl = decodeURIComponent(url_1.default.parse(req.url, true).query.callback_url);
                this.logger.debug("Callback URL", callbackUrl);
                resolve(callbackUrl);
            });
            this.server = express.listen(port);
        });
    }
    close() {
        this.server?.closeAllConnections();
        this.server?.close();
    }
};
CallbackServer = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __metadata("design:paramtypes", [logger_1.Logger])
], CallbackServer);
exports.CallbackServer = CallbackServer;
//# sourceMappingURL=callback_server.js.map