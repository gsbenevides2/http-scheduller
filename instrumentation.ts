import { CronnerService } from "./app/services/Cronner";

export function register() {
  CronnerService.gracefulStart();
}
