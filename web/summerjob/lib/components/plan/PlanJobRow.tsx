import { ActiveJobNoPlan } from "lib/types/active-job";
import { RideComplete } from "lib/types/ride";
import { WorkerComplete } from "lib/types/worker";
import Link from "next/link";
import { ExpandableRow } from "../table/ExpandableRow";
import { SimpleRow } from "../table/SimpleRow";
import type { Worker } from "lib/prisma/client";
import {
  useAPIActiveJobDelete,
  useAPIActiveJobUpdate,
} from "lib/fetcher/active-job";
import { translateAllergies } from "lib/types/allergy";
import { useState } from "react";
import ConfirmationModal from "../modal/ConfirmationModal";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import AddRideButton from "./AddRideButton";

interface PlanJobRowProps {
  job: ActiveJobNoPlan;
  isDisplayed: boolean;
  formatWorkerData: (
    worker: WorkerComplete,
    job: ActiveJobNoPlan
  ) => (string | JSX.Element)[];
  onWorkerDragStart: (
    worker: Worker,
    sourceId: string
  ) => (e: React.DragEvent<HTMLTableRowElement>) => void;
  reloadPlan: () => void;
}

export function PlanJobRow({
  job,
  isDisplayed,
  formatWorkerData,
  onWorkerDragStart,
  reloadPlan,
}: PlanJobRowProps) {
  const {
    trigger: triggerUpdate,
    isMutating: isBeingUpdated,
    error: updatingError,
  } = useAPIActiveJobUpdate(job.id, job.planId, {
    onSuccess: () => {
      reloadPlan();
    },
  });
  const {
    trigger: triggerDelete,
    isMutating: isBeingDeleted,
    error: deleteError,
    reset: resetDeleteError,
  } = useAPIActiveJobDelete(job.id, job.planId, {
    onSuccess: reloadPlan,
  });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const onWorkerDropped =
    (toJobId: string) => (e: React.DragEvent<HTMLTableRowElement>) => {
      const workerId = e.dataTransfer.getData("worker-id");
      const fromJobId = e.dataTransfer.getData("source-id");
      if (fromJobId === toJobId) {
        return;
      }

      const newWorkers = [...job.workers.map((w) => w.id), workerId];
      triggerUpdate({ workerIds: newWorkers });
    };

  const deleteJob = () => {
    triggerDelete();
    setShowDeleteConfirmation(false);
  };

  const confirmDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const onErrorMessageClose = () => {
    resetDeleteError();
  };

  return (
    <>
      {isDisplayed && (
        <ExpandableRow
          key={job.id}
          data={formatRowData(job, confirmDelete, isBeingDeleted)}
          onDrop={onWorkerDropped(job.id)}
        >
          <>
            <div className="ms-2">
              <strong>Pozn??mka pro organiz??tory</strong>
              <p>{job.privateDescription}</p>
              <strong>Popis</strong>
              <p>{job.publicDescription}</p>

              <div className="d-flex gap-1">
                <strong>Doprava</strong>
                <AddRideButton job={job} />
              </div>

              <p>{formatRideData(job)}</p>
              <strong>Alergeny</strong>
              <p>{formatAllergens(job)}</p>
              <p>
                <strong>Zodpov??dn?? osoba: </strong>
                {responsibleWorkerName(job)}
              </p>
            </div>
            <div className="table-responsive text-nowrap">
              <table className="table table-hover">
                <tbody>
                  {job.workers.length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <i>????dn?? pracovn??ci</i>
                      </td>
                    </tr>
                  )}
                  {job.workers.map((worker) => (
                    <SimpleRow
                      data={formatWorkerData(worker, job)}
                      key={worker.id}
                      draggable={true}
                      onDragStart={onWorkerDragStart(worker, job.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
          {showDeleteConfirmation && !deleteError && (
            <ConfirmationModal
              onConfirm={deleteJob}
              onReject={() => setShowDeleteConfirmation(false)}
            >
              <p>
                Opravdu chcete smazat job <b>{job.proposedJob.name}</b>?
              </p>
            </ConfirmationModal>
          )}
          {deleteError && (
            <ErrorMessageModal
              onClose={onErrorMessageClose}
              message={"Nepovedlo se odstranit job."}
            />
          )}
        </ExpandableRow>
      )}
    </>
  );
}

function formatRideData(job: ActiveJobNoPlan) {
  if (!job.rides || job.rides.length == 0) return <>Nen??</>;

  const formatSingleRide = (ride: RideComplete, index: number) => {
    const isDriverFromJob = job.workers.find((w) => w.id === ride.driverId);
    const otherJobs = ride.jobs.filter((j) => j.id !== job.id);

    return (
      <>
        {index + 1}
        {")"} {ride.car.name}: {ride.driver.firstName} {ride.driver.lastName}{" "}
        (obsazenost: {ride.passengers.length + 1}/{ride.car.seats})
        {!isDriverFromJob && <i>(??idi?? z jin??ho jobu)</i>}
        <br />
        {isDriverFromJob && otherJobs.length > 0 && (
          <>
            D??le odv??????: {otherJobs.map((j) => j.proposedJob.name).join(", ")}
          </>
        )}
      </>
    );
  };

  return (
    <>
      {job.rides.map((r, index) => (
        <span key={r.id}>{formatSingleRide(r, index)}</span>
      ))}
    </>
  );
}

function responsibleWorkerName(job: ActiveJobNoPlan) {
  if (!job.responsibleWorker) return "Nen??";
  return `${job.responsibleWorker?.firstName} ${job.responsibleWorker?.lastName}`;
}

function formatAmenities(job: ActiveJobNoPlan) {
  return (
    <>
      {job.proposedJob.hasFood && (
        <i className="fas fa-utensils me-2" title="J??dlo na m??st??"></i>
      )}{" "}
      {job.proposedJob.hasShower && (
        <i className="fas fa-shower" title="Sprcha na m??st??"></i>
      )}
    </>
  );
}

function formatAllergens(job: ActiveJobNoPlan) {
  if (job.proposedJob.allergens.length == 0) return "????dn??";
  return translateAllergies(job.proposedJob.allergens)
    .map((a) => a.code)
    .join(", ");
}

function formatRowData(
  job: ActiveJobNoPlan,
  deleteJob: () => void,
  isBeingDeleted: boolean
) {
  return [
    job.proposedJob.name,
    `${job.workers.length}/${job.proposedJob.maxWorkers}`,
    job.proposedJob.contact,
    job.proposedJob.area.name,
    job.proposedJob.address,
    formatAmenities(job),
    <span
      key={job.id}
      className="d-flex align-items-center gap-3 smj-table-actions-cell"
    >
      <Link
        href={`/plans/${job.planId}/${job.id}`}
        onClick={(e) => e.stopPropagation()}
        className="smj-action-edit"
      >
        <i className="fas fa-edit" title="Upravit"></i>
      </Link>

      {deleteJobIcon(deleteJob, isBeingDeleted)}
      <span style={{ width: "0px" }}></span>
    </span>,
  ];
}

function deleteJobIcon(deleteJob: () => void, isBeingDeleted: boolean) {
  return (
    <>
      {!isBeingDeleted && (
        <>
          <i
            className="fas fa-trash-alt smj-action-delete"
            title="Smazat"
            onClick={(e) => {
              e.stopPropagation();
              deleteJob();
            }}
          ></i>
          <span style={{ width: "0px" }}></span>
        </>
      )}
      {isBeingDeleted && (
        <i
          className="fas fa-spinner smj-action-delete spinning"
          title="Odstra??ov??n??..."
        ></i>
      )}
    </>
  );
}
