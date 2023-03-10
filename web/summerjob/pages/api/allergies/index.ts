import { http_method_handler } from "lib/api/method_handler";
import { getAllergies } from "lib/data/allergies";
import { NextApiRequest, NextApiResponse } from "next";

export type AllergiesAPIGetResponse = Awaited<ReturnType<typeof getAllergies>>;
async function get(
  req: NextApiRequest,
  res: NextApiResponse<AllergiesAPIGetResponse>
) {
  const allergies = await getAllergies();
  res.status(200).json(allergies);
}

export default http_method_handler({ get: get });
