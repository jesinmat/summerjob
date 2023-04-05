import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { createActiveJob, createActiveJobs } from "lib/data/active-jobs";
import { ApiError, WrappedError } from "lib/data/api-error";
import {
  ActiveJobCreateData,
  ActiveJobCreateMultipleData,
  ActiveJobCreateMultipleSchema,
  ActiveJobCreateSchema,
} from "lib/types/active-job";
import { Permission } from "lib/types/auth";
import { NextApiRequest, NextApiResponse } from "next";

export type ActiveJobsAPIPostData =
  | Omit<ActiveJobCreateData, "planId">
  | Omit<ActiveJobCreateMultipleData, "planId">;
export type ActiveJobsAPIPostResponse = Awaited<
  ReturnType<typeof createActiveJob>
>;
async function post(
  req: NextApiRequest,
  res: NextApiResponse<ActiveJobsAPIPostResponse | WrappedError<ApiError>>
) {
  const createSingle = ActiveJobCreateSchema.safeParse({
    ...req.body,
    planId: req.query.planId,
  });
  if (createSingle.success) {
    const job = await createActiveJob(createSingle.data);
    res.status(201).json(job);
    return;
  }

  const createMultiple = validateOrSendError(
    ActiveJobCreateMultipleSchema,
    { ...req.body, planId: req.query.planId },
    res
  );
  if (!createMultiple) {
    return;
  }
  const jobs = await createActiveJobs(createMultiple);
  res.status(202).end();
}

export default APIAccessController(
  [Permission.PLANS],
  APIMethodHandler({ post })
);
