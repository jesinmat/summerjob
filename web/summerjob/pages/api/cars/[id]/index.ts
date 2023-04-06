import { APIAccessController } from "lib/api/APIAccessControler";
import { APIMethodHandler } from "lib/api/MethodHandler";
import { validateOrSendError } from "lib/api/validator";
import { deleteCar, getCarById, updateCar } from "lib/data/cars";
import { Permission } from "lib/types/auth";
import { CarUpdateSchema } from "lib/types/car";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const carData = validateOrSendError(CarUpdateSchema, req.body, res);
  if (!carData) {
    return;
  }
  await updateCar(id, carData);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  await deleteCar(id);
  res.status(204).end();
}

export default APIAccessController(
  [Permission.CARS],
  APIMethodHandler({ patch, del })
);
