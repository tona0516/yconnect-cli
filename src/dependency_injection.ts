import {
  container,
  DependencyContainer as TsyringeDependencyContainer,
} from "tsyringe";
import { CallbackServer } from "./callback_server";
import { Logger } from "./logger";
import { Usecase } from "./usecase";
import { UserinfoApi } from "./userinfoapi";
import { YConnect } from "./yconnect";

export class DependencyInjection {
  private static instance: DependencyInjection;
  container: TsyringeDependencyContainer;

  private constructor() {
    this.container = this.init();
  }

  static getInstance(): DependencyInjection {
    if (!this.instance) {
      this.instance = new DependencyInjection();
    }

    return this.instance;
  }

  private init(): TsyringeDependencyContainer {
    container.registerSingleton("Logger", Logger);
    container.register("CallbackServer", { useClass: CallbackServer });
    container.register("UserinfoApi", { useClass: UserinfoApi });
    container.register("YConnect", { useClass: YConnect });
    container.register("Usecase", { useClass: Usecase });

    return container;
  }
}
