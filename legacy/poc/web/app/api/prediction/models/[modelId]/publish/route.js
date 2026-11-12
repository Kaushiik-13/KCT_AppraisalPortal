import { modelPublish } from "../../../../../../server/prediction/modelRoutes.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const { modelId } = await params;
  return modelPublish(request, modelId);
}
