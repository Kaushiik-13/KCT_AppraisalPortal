import { predictionInference } from "../../../../server/prediction/predictionRoute.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  return predictionInference(request);
}
