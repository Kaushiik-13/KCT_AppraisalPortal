import PredictionStudio from "../../src/prediction/PredictionStudio.jsx";
import organization from "../../fixtures/prediction/kct/config/organization.json" with { type: "json" };
import policy from "../../fixtures/prediction/kct/config/pads-policy-v1.json" with { type: "json" };

export const metadata = {
  title: "AFPI · Prediction Framework",
  description: "Configure synthetic appraisal data, compare models, govern publication, and try read-only predictions.",
};

export default function PredictionPage() {
  return <PredictionStudio organization={organization} policy={policy} />;
}
