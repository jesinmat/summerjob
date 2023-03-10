import { ActiveJob, Plan, ProposedJob } from "lib/prisma/client";
import { ProposedJobNoActive } from "./proposed-job";
import type { Worker } from "lib/prisma/client";
import { RideComplete } from "./ride";
import { z } from "zod";
import { WorkerComplete } from "./worker";
import { Serialized } from "./serialize";

export type ActiveJobNoPlan = ActiveJob & {
  workers: WorkerComplete[];
  proposedJob: ProposedJobNoActive;
  rides: RideComplete[];
  responsibleWorker: Worker | null;
};

export type ActiveJobComplete = ActiveJob & {
  workers: WorkerComplete[];
  proposedJob: ProposedJobNoActive;
  rides: RideComplete[];
  responsibleWorker: Worker | null;
  plan: Plan;
};

export type ActiveJobWithWorkersRides = ActiveJob & {
  workers: Worker[];
  rides: RideComplete[];
};

export type ActiveJobWithProposed = ActiveJob & {
  proposedJob: ProposedJob;
};

export const ActiveJobCreateSchema = z
  .object({
    proposedJobId: z.string(),
    privateDescription: z.string(),
    publicDescription: z.string(),
    planId: z.string(),
  })
  .strict();

export type ActiveJobCreateData = z.infer<typeof ActiveJobCreateSchema>;

export const ActiveJobUpdateSchema = z
  .object({
    id: z.string(),
    privateDescription: z.string(),
    publicDescription: z.string(),
    proposedJobId: z.string(),
    workerIds: z.array(z.string()),
    responsibleWorkerId: z.string(),
    rideIds: z.array(z.string()),
  })
  .partial()
  .strict();

export type ActiveJobUpdateData = z.infer<typeof ActiveJobUpdateSchema>;

export function serializeActiveJob(
  job: ActiveJobComplete
): Serialized<ActiveJobComplete> {
  return {
    data: JSON.stringify(job),
  };
}

export function deserializeActiveJob(job: Serialized<ActiveJobComplete>) {
  const parsed = JSON.parse(job.data) as ActiveJobComplete;
  parsed.plan.day = new Date(parsed.plan.day);
  return parsed;
}
