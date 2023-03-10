"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAPIProposedJobCreate } from "lib/fetcher/proposed-job";
import { Allergy, Area } from "lib/prisma/client";
import { deserializeAllergies } from "lib/types/allergy";
import { deserializeAreas } from "lib/types/areas";
import {
  ProposedJobCreateData,
  ProposedJobCreateSchema,
} from "lib/types/proposed-job";
import { Serialized } from "lib/types/serialize";
import { WorkerBasicInfo } from "lib/types/worker";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FilterSelect, FilterSelectItem } from "../filter-select/FilterSelect";
import AllergyPill from "../forms/AllergyPill";
import ErrorMessageModal from "../modal/ErrorMessageModal";
import SuccessProceedModal from "../modal/SuccessProceedModal";

interface CreateProposedJobProps {
  serializedAreas: Serialized<Area[]>;
  serializedAllergens: Serialized<Allergy>;
}

export default function CreateProposedJobForm({
  serializedAreas,
  serializedAllergens,
}: CreateProposedJobProps) {
  const areas = deserializeAreas(serializedAreas);
  const allergens = deserializeAllergies(serializedAllergens);
  const { trigger, error, isMutating, reset } = useAPIProposedJobCreate();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProposedJobCreateData>({
    resolver: zodResolver(ProposedJobCreateSchema),
    defaultValues: {},
  });

  const onSubmit = (data: ProposedJobCreateData) => {
    trigger(data, {
      onSuccess: () => {
        setSaved(true);
      },
    });
  };

  const selectArea = (item: FilterSelectItem) => {
    setValue("areaId", item.id);
  };

  return (
    <>
      <div className="row">
        <div className="col">
          <h3>Přidat job</h3>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <label className="form-label fw-bold mt-4" htmlFor="name">
              Název jobu
            </label>
            <input
              className="form-control p-1 ps-2"
              id="name"
              {...register("name")}
            />
            {errors.name && (
              <div className="text-danger">Zadejte název jobu</div>
            )}
            <label className="form-label fw-bold mt-4" htmlFor="description">
              Popis navrhované práce
            </label>
            <textarea
              className="form-control border p-1 ps-2"
              id="description"
              rows={3}
              {...register("description")}
            ></textarea>
            <label className="form-label fw-bold mt-4" htmlFor="area">
              Oblast jobu
            </label>
            <input type={"hidden"} {...register("areaId")} />
            <FilterSelect
              items={areas.map(areaToSelectItem)}
              placeholder="Vyberte oblast"
              onSelected={selectArea}
            />
            {errors.areaId && <div className="text-danger">Vyberte oblast</div>}
            <label className="form-label fw-bold mt-4" htmlFor="address">
              Adresa
            </label>
            <input
              className="form-control p-1 ps-2"
              id="address"
              {...register("address")}
            />
            {errors.address && (
              <div className="text-danger">Zadejte adresu</div>
            )}
            <label className="form-label fw-bold mt-4" htmlFor="contact">
              Kontakt
            </label>
            <input
              className="form-control p-1 ps-2"
              id="contact"
              {...register("contact")}
            />
            {errors.contact && (
              <div className="text-danger">Zadejte kontaktní informace</div>
            )}
            <label className="form-label fw-bold mt-4" htmlFor="requiredDays">
              Celkový počet dnů na splnění
            </label>
            <input
              className="form-control p-1 ps-2"
              id="requiredDays"
              type="number"
              {...register("requiredDays", { valueAsNumber: true })}
            />
            {errors.requiredDays && (
              <div className="text-danger">Zadejte odhadovaný počet dnů</div>
            )}
            <label className="form-label fw-bold mt-4" htmlFor="minWorkers">
              Počet pracovníků minimálně / maximálně / z toho silných
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
            {(errors.minWorkers ||
              errors.maxWorkers ||
              errors.strongWorkers) && (
              <div className="text-danger">Zadejte počty pracovníků</div>
            )}

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
                Strava na místě
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
                Sprcha na místě
              </label>
            </div>

            <div className="d-flex justify-content-between gap-3">
              <button
                className="btn btn-secondary mt-4"
                type="button"
                onClick={() => window.history.back()}
              >
                Zpět
              </button>
              <input
                type={"submit"}
                className="btn btn-warning mt-4"
                value={"Uložit"}
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

function areaToSelectItem(area: Area): FilterSelectItem {
  return {
    id: area.id,
    searchable: `${area.name} ${area.description}`,
    name: area.name,
    item: <span>{area.name}</span>,
  };
}
