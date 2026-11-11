import { predictionDatasetGeneration } from "../../../../../server/prediction/generationRoute.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request) {
  return predictionDatasetGeneration(request);
}
