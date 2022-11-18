import {
  container,
  DependencyContainer as TsyringeDependencyContainer,
} from "tsyringe";
import { CallbackServer } from "./callback_server";
import { Logger } from "./logger";
import { Usecase } from "./usecase";
import { Userinfo } from "./userinfo";
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
    container.register("Logger", { useClass: Logger });
    container.register("CallbackServer", { useClass: CallbackServer });
    container.register("Userinfo", { useClass: Userinfo });
    container.register("YConnect", { useClass: YConnect });
    container.register("Usecase", { useClass: Usecase });

    return container;
  }
}
