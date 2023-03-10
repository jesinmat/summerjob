"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIProposedJobUpdate } from "lib/fetcher/proposed-job";
import { Allergy } from "lib/prisma/client";
import { deserializeAllergies } from "lib/types/allergy";
import {
  deserializeProposedJob,
  ProposedJobUpdateData,
  ProposedJobUpdateSchema,
} from "lib/types/proposed-job";
import { Serialized } from "lib/types/serialize";
import { WorkerBasicInfo } from "lib/types/worker";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FilterSelectItem } from "../filter-select/FilterSelect";
import AllergyPill from "../forms/AllergyPill";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import SuccessProceedModal from "../modal/SuccessProceedModal";

interface EditProposedJobProps {
  serializedJob: string;
  serializedAllergens: Serialized<Allergy>;
}

export default function EditProposedJobForm({
  serializedJob,
  serializedAllergens,
}: EditProposedJobProps) {
  const job = deserializeProposedJob(serializedJob);
  const allergens = deserializeAllergies(serializedAllergens);
  const { trigger, error, isMutating, reset } = useAPIProposedJobUpdate(job.id);
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProposedJobUpdateData>({
    resolver: zodResolver(ProposedJobUpdateSchema),
    defaultValues: {
      name: job.name,
      description: job.description,
      allergens: job.allergens.map((allergy) => allergy.id),
      address: job.address,
      contact: job.contact,
      requiredDays: job.requiredDays,
      minWorkers: job.minWorkers,
      maxWorkers: job.maxWorkers,
      strongWorkers: job.strongWorkers,
      hasFood: job.hasFood,
      hasShower: job.hasShower,
    },
  });

  const onSubmit = (data: ProposedJobUpdateData) => {
    trigger(data, {
      onSuccess: () => {
        setSaved(true);
      },
    });
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Upravit job</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="form-label fw-bold mt-4" htmlFor="name">
              N??zev jobu
            </label>
            <input
              className="form-control p-1 ps-2"
              id="name"
              {...register("name")}
            />
            <label className="form-label fw-bold mt-4" htmlFor="description">
              Popis navrhovan?? pr??ce
            </label>
            <textarea
              className="form-control border p-1 ps-2"
              id="description"
              rows={3}
              {...register("description")}
            ></textarea>
            <label className="form-label fw-bold mt-4" htmlFor="address">
              Adresa
            </label>
            <input
              className="form-control p-1 ps-2"
              id="address"
              {...register("address")}
            />
            <label className="form-label fw-bold mt-4" htmlFor="contact">
              Kontakt
            </label>
            <input
              className="form-control p-1 ps-2"
              id="contact"
              {...register("contact")}
            />
            <label className="form-label fw-bold mt-4" htmlFor="requiredDays">
              Celkov?? po??et dn?? na spln??n??
            </label>
            <input
              className="form-control p-1 ps-2"
              id="requiredDays"
              {...register("requiredDays", { valueAsNumber: true })}
            />
            <label className="form-label fw-bold mt-4" htmlFor="minWorkers">
              Po??et pracovn??k?? minim??ln?? / maxim??ln?? / z toho siln??ch
            </label>

            <div className="d-flex w-50">
              <input
                className="form-control p-1 ps-2"
                id="minWorkers"
                type="number"
                min={1}
                {...register("minWorkers", { valueAsNumber: true })}
              />
              /
              <input
                className="form-control p-1 ps-2"
                id="maxWorkers"
                type="number"
                min={1}
                {...register("maxWorkers", { valueAsNumber: true })}
              />
              /
              <input
                className="form-control p-1 ps-2"
                id="strongWorkers"
                type="number"
                min={0}
                {...register("strongWorkers", { valueAsNumber: true })}
              />
            </div>

            <label className="form-label d-block fw-bold mt-4" htmlFor="email">
              Alergie
            </label>
            <div className="form-check-inline">
              {allergens.map((allergy) => (
                <AllergyPill
                  key={allergy.id}
                  allergy={allergy}
                  register={() => register("allergens")}
                />
              ))}
            </div>

            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="hasFood"
                {...register("hasFood")}
              />
              <label className="form-check-label" htmlFor="hasFood">
                <i className="fa fa-utensils ms-2 me-2"></i>
                Strava na m??st??
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="hasShower"
                {...register("hasShower")}
              />
              <label className="form-check-label" htmlFor="hasShower">
                <i className="fa fa-shower ms-2 me-2"></i>
                Sprcha na m??st??
              </label>
            </div>

            <div className="d-flex justify-content-between gap-3">
              <button
                className="btn btn-secondary mt-4"
                type="button"
                onClick={() => window.history.back()}
              >
                Zp??t
              </button>
              <input
                type={"submit"}
                className="btn btn-warning mt-4"
                value={"Ulo??it"}
                disabled={isMutating}
              />
            </div>
          </form>
        </div>
      </div>
      {saved && <SuccessProceedModal onClose={() => window.history.back()} />}
      {error && <ErrorMessageModal onClose={reset} />}
    </>
  );
}

function workerToSelectItem(worker: WorkerBasicInfo): FilterSelectItem {
  return {
    id: worker.id,
    searchable: `${worker.firstName} ${worker.lastName}`,
    name: `${worker.firstName} ${worker.lastName}`,
    item: (
      <span>
        {worker.firstName} {worker.lastName}
      </span>
    ),
  };
}
