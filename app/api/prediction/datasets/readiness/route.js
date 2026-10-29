import { predictionReadiness } from "../../../../../server/prediction/readinessRoute.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request) {
  return predictionReadiness(request);
}
