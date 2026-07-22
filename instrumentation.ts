import { CronnerService } from "./server/services/Cronner";

export function register() {
  CronnerService.gracefulStart();
}
