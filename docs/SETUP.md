# Setup and local development

## Requirements

- Node.js **20.9 or later** and npm; install exact dependencies from `package-lock.json`.
- Python 3 with `ml/prediction_service/requirements.txt` **only** for local Prediction model training and Python tests.
- Browser with localStorage enabled for Framework Studio drafts.

The historically tested environment used Node 22.14.0 and Next.js 16.3.8. Versions are reproducibility context, not a guarantee for other environments.

## Install and run

From repository root:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/` (Framework Studio) or `http://127.0.0.1:5173/prediction` (Prediction Studio).

```bash
npm test
npm run build
npm run start
```

Stop the dev server before `npm run start`, because both use port **5173**. `npm run build` prepares the PDF.js worker and writes the Next.js build to `.next/`. Windows PowerShell users whose execution policy blocks `npm.ps1` can substitute `npm.cmd`.

## Python model provider (local only)

Create an isolated Python environment and install:

```bash
python -m pip install -r ml/prediction_service/requirements.txt
npm run test:prediction-ml
```

Set the server-side `PREDICTION_PYTHON` variable if the executable is not named `python`. The provider is invoked by Node for local model training/comparison and inference. The in-process registry and model artifacts are lost when the server restarts. Do not assume Vercel deployments provide this Python service.

## Optional AI provider

For live AI evaluations, place the API key in a local `.env.local` file:

```dotenv
OPENROUTER_API_KEY=replace_with_your_key
```

Do not commit the file or expose this value through a `NEXT_PUBLIC_` variable. The server route handlers use OpenRouter; simulated mode runs without a live key. The `/api/ai-status` endpoint checks whether a key is configured, not whether it works.

## Operational boundaries

- Drafts are stored by **browser origin**. `localhost` and `127.0.0.1` do not share a draft.
- Crossref lookup and live AI require network access. When enabled, selected extracted document text and rubric/context may be sent to OpenRouter.
- Next.js API routes require a server runtime; a static export is insufficient.
- A successful Next.js/Vercel deployment does not establish a secure production system: authentication, tenant isolation, durable data and controlled ML hosting are absent.

See [Troubleshooting](TROUBLESHOOTING.md) and [Security and data](SECURITY-AND-DATA.md).
