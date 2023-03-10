import { http_method_handler } from "lib/api/method_handler";
import { deleteCar, getCarById, updateCar } from "lib/data/cars";
import { CarUpdateSchema } from "lib/types/car";
import { NextApiRequest, NextApiResponse } from "next";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  const carData = CarUpdateSchema.parse(req.body);
  await updateCar(id, carData);
  res.status(204).end();
}

async function del(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string;
  // FIXME Anonymize data if there are rides instead of ignoring the request
  // --->
  const car = await getCarById(id);
  if (!car) {
    res.status(204).end();
    return;
  }
  if (car?.rides.length > 0) {
    res.status(409).end();
    return;
  }
  // <---
  await deleteCar(id);
  res.status(204).end();
}

export default http_method_handler({ patch: patch, del: del });
