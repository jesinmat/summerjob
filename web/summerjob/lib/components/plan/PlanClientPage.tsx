"use client";
import ErrorPage from "lib/components/error-page/error";
import AddJobToPlanForm from "lib/components/plan/AddJobToPlanForm";
import { Modal, ModalSize } from "lib/components/modal/Modal";
import PageHeader from "lib/components/page-header/PageHeader";
import { PlanFilters } from "lib/components/plan/PlanFilters";
import { PlanTable } from "lib/components/plan/PlanTable";
import { useAPIPlan, useAPIPlanDelete } from "lib/fetcher/plan";
import { useAPIWorkersWithoutJob } from "lib/fetcher/worker";
import { filterUniqueById, formatDateLong } from "lib/helpers/helpers";
import { ActiveJobNoPlan } from "lib/types/active-job";
import { deserializePlan, PlanComplete } from "lib/types/plan";
import { WorkerComplete } from "lib/types/worker";
import { useMemo, useState } from "react";
import ErrorPage404 from "../404/404";
import ConfirmationModal from "../modal/ConfirmationModal";
import ErrorMessageModal from "../modal/ErrorMessageModal";

interface PlanClientPageProps {
  id: string;
  initialDataPlan: string;
  initialDataJoblessWorkers: WorkerComplete[];
}

export default function PlanClientPage({
  id,
  initialDataPlan,
  initialDataJoblessWorkers,
}: PlanClientPageProps) {
  const initialDataPlanParsed = deserializePlan(initialDataPlan);

  const { data, error, mutate } = useAPIPlan(id, {
    fallbackData: initialDataPlanParsed,
  });
  const { data: workersWithoutJob, mutate: reloadJoblessWorkers } =
    useAPIWorkersWithoutJob(id, {
      fallbackData: initialDataJoblessWorkers,
    });

  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const openModal = () => setIsJobModalOpen(true);
  const closeModal = () => {
    mutate();
    setIsJobModalOpen(false);
  };

  const updateJoblessWorkers = (expectedValue: WorkerComplete[]) => {
    reloadJoblessWorkers([...expectedValue]);
  };

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const {
    trigger: triggerDelete,
    isMutating: isBeingDeleted,
    error: deleteError,
    reset: resetDeleteError,
  } = useAPIPlanDelete(data!.id, {
    onSuccess: () => window.history.back(),
  });

  const deletePlan = () => {
    triggerDelete();
    setShowDeleteConfirmation(false);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const onErrorMessageClose = () => {
    resetDeleteError();
  };

  const searchableJobs = useMemo(() => {
    const map = new Map<string, string>();
    data?.jobs.forEach((job) => {
      const workerNames = job.workers
        .map((w) => `${w.firstName} ${w.lastName}`)
        .join(" ");
      map.set(
        job.id,
        (
          job.proposedJob.name +
          job.proposedJob.area.name +
          job.proposedJob.address +
          job.proposedJob.contact +
          workerNames
        ).toLocaleLowerCase()
      );
    });
    return map;
  }, [data?.jobs]);

  const areas = getAvailableAreas(data ?? undefined);
  const [selectedArea, setSelectedArea] = useState(areas[0]);

  const onAreaSelected = (id: string) => {
    setSelectedArea(areas.find((a) => a.id === id) || areas[0]);
  };

  const [filter, setFilter] = useState("");

  if (error && !data) {
    return <ErrorPage error={error} />;
  }

  function shouldShowJob(job: ActiveJobNoPlan) {
    const isInArea =
      selectedArea.id === areas[0].id ||
      job.proposedJob.area.id === selectedArea.id;
    const text = searchableJobs.get(job.id);
    if (text) {
      return isInArea && text.includes(filter.toLowerCase());
    }
    return isInArea;
  }

  return (
    <>
      {data === null && <ErrorPage404 message="Pl??n nenalezen." />}
      {data !== null && (
        <>
          <PageHeader
            title={data ? formatDateLong(data?.day, true) : "Na????t??n??..."}
          >
            <button
              className="btn btn-warning"
              type="button"
              onClick={openModal}
            >
              <i className="fas fa-briefcase"></i>
              <span>P??idat job</span>
            </button>
            <button className="btn btn-primary" type="button">
              <i className="fas fa-cog"></i>
              <span>Vygenerovat pl??n</span>
            </button>
            <button className="btn btn-primary" type="button">
              <i className="fas fa-print"></i>
              <span>Tisknout</span>
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={confirmDelete}
            >
              <i className="fas fa-trash-alt"></i>
              <span>Odstranit</span>
            </button>
          </PageHeader>

          <section>
            <div className="container-fluid">
              <div className="row gx-3">
                <div className="col">
                  <PlanFilters
                    search={filter}
                    onSearchChanged={setFilter}
                    areas={areas}
                    selectedArea={selectedArea}
                    onAreaSelected={onAreaSelected}
                  />
                </div>
              </div>
              <div className="row gx-3">
                <div className="col-sm-12 col-lg-10">
                  <PlanTable
                    plan={data}
                    shouldShowJob={shouldShowJob}
                    joblessWorkers={workersWithoutJob || []}
                    reloadJoblessWorkers={updateJoblessWorkers}
                    reloadPlan={mutate}
                  />
                </div>
                <div className="col-sm-12 col-lg-2">
                  <div className="vstack smj-search-stack smj-shadow rounded-3">
                    <h5>Statistiky</h5>
                    <hr />
                    <ul className="list-group list-group-flush ">
                      <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                        Nasazen??ch pracovn??k??
                        <span>
                          {data?.jobs.flatMap((x) => x.workers).length}
                        </span>
                      </li>
                      <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                        Bez pr??ce
                        <span>
                          {workersWithoutJob && workersWithoutJob.length}
                        </span>
                      </li>
                      <li className="list-group-item ps-0 pe-0 d-flex justify-content-between align-items-center smj-gray">
                        Napl??novan?? joby
                        <span>{data && data.jobs.length}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {isJobModalOpen && (
              <Modal
                title={"P??idat job do pl??nu"}
                size={ModalSize.LARGE}
                onClose={closeModal}
              >
                <AddJobToPlanForm planId={id} onComplete={closeModal} />
              </Modal>
            )}
            {showDeleteConfirmation && !deleteError && (
              <ConfirmationModal
                onConfirm={deletePlan}
                onReject={() => setShowDeleteConfirmation(false)}
              >
                <p>Opravdu chcete smazat tento pl??n?</p>
                {data!.jobs.length > 0 && (
                  <div className="alert alert-danger">
                    Tento pl??n obsahuje napl??novan?? joby!
                    <br /> Jeho odstran??n??m z??rove?? odstran??te i odpov??daj??c??
                    napl??novan?? joby.
                  </div>
                )}
              </ConfirmationModal>
            )}
            {deleteError && (
              <ErrorMessageModal
                onClose={onErrorMessageClose}
                message={"Nepovedlo se odstranit pl??n."}
              />
            )}
          </section>
        </>
      )}
    </>
  );
}

function getAvailableAreas(plan?: PlanComplete) {
  const ALL_AREAS = { id: "all", name: "Vyberte oblast" };
  const jobs = plan?.jobs.flatMap((j) => j.proposedJob);
  const areas = filterUniqueById(
    jobs?.map((job) => ({ id: job.area.id, name: job.area.name })) || []
  );
  areas.sort((a, b) => a.name.localeCompare(b.name));
  areas.unshift(ALL_AREAS);
  return areas;
}
