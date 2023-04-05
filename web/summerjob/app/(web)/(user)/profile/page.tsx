import { getSMJSession } from "lib/auth/auth";
import ErrorPage404 from "lib/components/404/404";
import AccessDeniedPage from "lib/components/error-page/AccessDeniedPage";
import EditBox from "lib/components/forms/EditBox";
import EditProfile from "lib/components/profile/EditProfile";
import { getAllergies } from "lib/data/allergies";
import { cache_getActiveSummerJobEvent } from "lib/data/cache";
import { getWorkerById } from "lib/data/workers";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeWorker } from "lib/types/worker";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const session = await getSMJSession();
  const worker = await getWorkerById(session!.userID);
  if (!worker) {
    return <ErrorPage404 message="Pracant nenalezen." />;
  }
  const serializedWorker = serializeWorker(worker);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);
  const summerJobEvent = await cache_getActiveSummerJobEvent();
  if (!summerJobEvent) {
    return <ErrorPage404 message="Není nastaven aktivní SummerJob ročník." />;
  }
  const { startDate, endDate } = summerJobEvent;

  return (
    <>
      <section className="mb-3">
        <EditBox>
          <EditProfile
            serializedWorker={serializedWorker}
            serializedAllergens={serializedAllergens}
            eventStartDate={startDate.toJSON()}
            eventEndDate={endDate.toJSON()}
          />
        </EditBox>
      </section>
    </>
  );
}
