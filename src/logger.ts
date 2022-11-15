/* eslint-disable  @typescript-eslint/no-explicit-any */

export interface Logger {
  debug(title: string, message: any): void;
  info(title: string, message: any): void;
}

export class Stdout implements Logger {
  isDebug: boolean;
  constructor(isDebug: boolean) {
    this.isDebug = isDebug;
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
