/* eslint-disable  @typescript-eslint/no-explicit-any */
import { injectable } from "tsyringe";

@injectable()
export class Logger implements Logger {
  private isDebug = false;

  enableDebug(): void {
    this.isDebug = true;
  }

  debug(title: string, message: any) {
    if (!this.isDebug) {
      return;
    }

    console.log(`> ${title}`);
    console.log(message);
    console.log();
  }

  info(title: string, message: any) {
    console.info(`> ${title}`);
    console.info(message);
    console.info();
  }
}
