import { predictionTraining } from "../../../../server/prediction/trainingRoute.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request) {
  return predictionTraining(request);
}
