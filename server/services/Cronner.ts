import type { CronJob } from "bun";
import { SchedulledRequests } from "../modules/schedulled_requests/service";

interface CronnerJob {
  id: string;
  triggerType: "cron" | "date";
  triggerValue: string;
}

type JobHandle = CronJob | ReturnType<typeof setTimeout>;

const MAX_TIMEOUT_MS = 2_147_483_647;

export class CronnerService {
  static jobs = new Map<string, JobHandle>();
  static jobVersions = new Map<string, number>();
  static runningJobs = new Set<Promise<void>>();

  static async upsertJob(job: CronnerJob) {
    const currentVersion = CronnerService.jobVersions.get(job.id) ?? 0;
    const newVersion = currentVersion + 1;
    CronnerService.jobVersions.set(job.id, newVersion);

    if (CronnerService.checkJobExists(job.id)) {
      await CronnerService.removeJob(job.id);
    }

    if (job.triggerType === "cron") {
      const version = newVersion;
      const handle = Bun.cron(job.triggerValue, async () => {
        await CronnerService.processJob(job.id, version);
      });
      this.jobs.set(job.id, handle);
      return;
    }

    const targetDate = new Date(job.triggerValue);
    if (Number.isNaN(targetDate.getTime())) {
      console.warn(
        `[CronnerService] Invalid date triggerValue for ${job.id}: ${job.triggerValue}`,
      );
      return;
    }

    CronnerService.scheduleTimeout(job.id, targetDate, newVersion);
  }

  private static scheduleTimeout(
    jobId: string,
    targetDate: Date,
    version: number,
  ) {
    const remaining = targetDate.getTime() - Date.now();

    if (remaining <= 0) {
      CronnerService.processJob(jobId, version);
      return;
    }

    const delay = Math.min(remaining, MAX_TIMEOUT_MS);
    const handle = setTimeout(() => {
      if (CronnerService.jobVersions.get(jobId) !== version) {
        return;
      }

      const newRemaining = targetDate.getTime() - Date.now();

      if (newRemaining <= 0) {
        CronnerService.processJob(jobId, version);
      } else {
        CronnerService.scheduleTimeout(jobId, targetDate, version);
      }
    }, delay);

    this.jobs.set(jobId, handle);
  }

  static checkJobExists(id: string) {
    return this.jobs.has(id);
  }

  static async removeJob(id: string) {
    const handle = this.jobs.get(id);
    if (handle) {
      if ("stop" in handle) {
        handle.stop();
      } else {
        clearTimeout(handle);
      }
      this.jobs.delete(id);
    }
  }

  static async processJob(id: string, version?: number) {
    const currentVersion = CronnerService.jobVersions.get(id);
    if (version !== undefined && currentVersion !== version) {
      return;
    }

    const scheduler = await SchedulledRequests.getById(id);
    if (!scheduler) return;

    if (version !== undefined && CronnerService.jobVersions.get(id) !== version) {
      return;
    }

    const executionPromise = (async () => {
      try {
        await SchedulledRequests.executeRequest(scheduler, id);
        if (scheduler.excludeBeforeExecution) {
          await CronnerService.removeJob(id);
          await SchedulledRequests.deleteMany([id]);
        }
      } catch (err) {
        console.error(`[CronnerService] Error executing job ${id}:`, err);
      }
    })();

    CronnerService.runningJobs.add(executionPromise);
    executionPromise.finally(() => {
      CronnerService.runningJobs.delete(executionPromise);
    });
  }

  static async gracefulShutdown() {
    const handles = [...this.jobs.entries()];
    this.jobs.clear();
    this.jobVersions.clear();

    for (const [, handle] of handles) {
      if (typeof (handle as CronJob).stop === "function") {
        (handle as CronJob).stop();
      } else {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      }
    }

    if (CronnerService.runningJobs.size > 0) {
      console.log(
        `[CronnerService] Waiting for ${CronnerService.runningJobs.size} running jobs to complete...`,
      );
      await Promise.allSettled([...CronnerService.runningJobs]);
    }
  }

  static async gracefulStart() {
    const schedullers = await SchedulledRequests.getAll();
    await Promise.all(
      schedullers.map((scheduler) =>
        CronnerService.upsertJob({
          id: scheduler.externalId,
          triggerType: scheduler.triggerType,
          triggerValue: scheduler.triggerValue,
        }),
      ),
    );
  }

  static async upsertManyJobs(jobs: CronnerJob[]) {
    await Promise.all(jobs.map((job) => this.upsertJob(job)));
  }

  static async removeManyJobs(ids: string[]) {
    await Promise.all(ids.map((i) => this.removeJob(i)));
  }
}
