"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyInjection = void 0;
const idtoken_verifier_1 = require("./idtoken_verifier");
const tsyringe_1 = require("tsyringe");
const callback_server_1 = require("./callback_server");
const logger_1 = require("./logger");
const usecase_1 = require("./usecase");
const userinfoapi_1 = require("./userinfoapi");
const yconnect_1 = require("./yconnect");
class DependencyInjection {
    static instance;
    container;
    constructor() {
        this.container = this.init();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new DependencyInjection();
        }
        return this.instance;
    }
    init() {
        tsyringe_1.container.registerSingleton("Logger", logger_1.Logger);
        tsyringe_1.container.register("CallbackServer", { useClass: callback_server_1.CallbackServer });
        tsyringe_1.container.register("UserinfoApi", { useClass: userinfoapi_1.UserinfoApi });
        tsyringe_1.container.register("YConnect", { useClass: yconnect_1.YConnect });
        tsyringe_1.container.register("IdTokenVerifier", { useClass: idtoken_verifier_1.IdTokenVerifier });
        tsyringe_1.container.register("Usecase", { useClass: usecase_1.Usecase });
        return tsyringe_1.container;
    }
}
exports.DependencyInjection = DependencyInjection;
//# sourceMappingURL=dependency_injection.js.map