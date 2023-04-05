import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { getSMJSessionAPI } from "lib/auth/auth";
import { cache_getActiveSummerJobEventId } from "lib/data/cache";
import { getMyPlans } from "lib/data/my-plan";
import { NextApiRequest, NextApiResponse } from "next";

export type MyPlansAPIGetResponse = Awaited<ReturnType<typeof getMyPlans>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<MyPlansAPIGetResponse>
) {
  const summerJobEvent = await cache_getActiveSummerJobEventId();
  if (!summerJobEvent) {
    res.status(500).end();
    return;
  }
  const session = await getSMJSessionAPI(req, res);
  const plans = await getMyPlans(session!.userID);
  res.status(200).json(plans);
}

export default APIAccessController([], APIMethodHandler({ get }));
