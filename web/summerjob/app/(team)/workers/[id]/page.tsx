import ErrorPage404 from "lib/components/404/404";
import EditBox from "lib/components/forms/EditBox";
import EditWorker from "lib/components/worker/EditWorker";
import { getAllergies } from "lib/data/allergies";
import { getWorkerById } from "lib/data/workers";
import { translateAllergies, serializeAllergies } from "lib/types/allergy";
import { serializeWorker } from "lib/types/worker";

type Params = {
  params: {
    id: string;
  };
};

export default async function EditWorkerPage({ params }: Params) {
  const worker = await getWorkerById(params.id);
  if (!worker) {
    return <ErrorPage404 message="Pracant nenalezen." />;
  }
  const serializedWorker = serializeWorker(worker);
  const allergies = await getAllergies();
  const translatedAllergens = translateAllergies(allergies);
  const serializedAllergens = serializeAllergies(translatedAllergens);

  return (
    <>
      <section className="mb-3">
        <EditBox>
          <EditWorker
            serializedWorker={serializedWorker}
            serializedAllergens={serializedAllergens}
          />
        </EditBox>
      </section>
    </>
  );
}
