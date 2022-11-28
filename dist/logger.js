"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
/* eslint-disable  @typescript-eslint/no-explicit-any */
const tsyringe_1 = require("tsyringe");
let Logger = class Logger {
    isDebug = false;
    enableDebug() {
        this.isDebug = true;
    }
    debug(title, message) {
        if (!this.isDebug) {
            return;
        }
        console.log(`> ${title}`);
        console.log(message);
        console.log();
    }
    info(title, message) {
        console.info(`> ${title}`);
        console.info(message);
        console.info();
    }
    error(title, message) {
        console.error(`> ${title}`);
        console.error(message);
        console.error();
    }
};
Logger = __decorate([
    (0, tsyringe_1.singleton)()
], Logger);
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map