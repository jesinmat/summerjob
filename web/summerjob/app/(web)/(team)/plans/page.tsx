import ErrorPage from "lib/components/error-page/ErrorPage";
import PlansClientPage from "lib/components/plan/PlansClientPage";
import { getPlans } from "lib/data/plans";
import { getActiveSummerJobEvent } from "lib/data/summerjob-event";
import { serializePlans } from "lib/types/plan";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const plans = await getPlans();
  const serialized = serializePlans(plans);
  const summerJobEvent = await getActiveSummerJobEvent();
  const { startDate, endDate } = summerJobEvent!;
  return (
    <PlansClientPage
      initialData={serialized}
      startDate={startDate.toJSON()}
      endDate={endDate.toJSON()}
    />
  );
}
