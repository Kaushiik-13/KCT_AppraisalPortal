# Local setup

## Environment

The working environment used Node **22.14.0** and npm **11.16.0** on Windows. `package.json` requires Node **20.9.0 or later**. Installed versions at documentation time were Next.js 16.3.8, React 19 and PDF.js 4.10.38. Use the lockfile to reproduce dependencies.

From the project root:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open `http://127.0.0.1:5173/`. Use `npm.cmd` in PowerShell if execution policy blocks `npm.ps1`; other shells can use `npm`.

```powershell
npm.cmd test
npm.cmd run build
```

The production build is written to `.next/`. Stop development before starting the production server on the same port:

```powershell
npm.cmd run start
```

Development and production start bind to `127.0.0.1:5173`. The `prepare:pdf-worker` script copies the PDF.js worker into `public/` before development and production builds. The application needs a Next.js server runtime because AI is handled by route handlers; a static-file export is insufficient.

## Optional AI configuration

Create or edit `.env.local` at the root:

```dotenv
OPENROUTER_API_KEY=replace_with_your_key
```

Keep the key server-side. Do not prefix it with `NEXT_PUBLIC_`, put it in a workflow input, or include it in documentation. `.env.local` is ignored. Next.js route handlers read the environment value on the server; the browser never receives the key.

OpenRouter mode requests `openrouter/free`, with no paid fallback configured. The router chooses the actual model. `GET /api/ai-status` reports whether a non-empty key is configured, not whether it is valid. Simulated mode needs no key but does not execute custom AI instructions.

## Network and storage

- PDF extraction uses a bundled browser worker.
- Crossref lookup and live OpenRouter need network access.
- CSS loads Google Fonts; system fonts are fallbacks.
- Drafts depend on browser profile and exact origin. `localhost` and `127.0.0.1` have separate storage.

See [troubleshooting](TROUBLESHOOTING.md) and [security and data](SECURITY-AND-DATA.md).

## Vercel readiness

Vercel detects this as a Next.js project; no custom build command or output directory is required. Add `OPENROUTER_API_KEY` as a server-side environment variable for the environments that need live AI, then redeploy after changing it. Browser autosave remains scoped to each browser and deployment origin.

The repository has been migrated and locally build-verified, but no Vercel project has been created and no deployment has been performed. Authentication and durable rate limiting remain prerequisites before exposing the PoC publicly.
