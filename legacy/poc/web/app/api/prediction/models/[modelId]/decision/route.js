import { modelDecision } from "../../../../../../server/prediction/modelRoutes.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { modelId } = await params;
  return modelDecision(request, modelId);
}
