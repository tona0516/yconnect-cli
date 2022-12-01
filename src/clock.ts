import { singleton } from "tsyringe";

@singleton()
export class Clock {
  currentUnixtime(): number {
    return Date.now() / 1000;
  }
}
