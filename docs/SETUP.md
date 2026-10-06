# Local setup

## Environment

The working environment used Node **22.14.0** and npm **11.16.0** on Windows. `package.json` does not declare a Node engine requirement. Installed versions at documentation time were React 19.3.0, Vite 6.4.3, and PDF.js 4.10.38. Use the lockfile to reproduce dependencies.

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

Build output is `dist/`. Stop dev before starting preview on the same port:

```powershell
npm.cmd run preview
```

Dev and preview bind to loopback, port 5173, with strict-port behavior. Preview includes the local AI middleware. Static hosting of `dist/` alone does not provide the AI endpoint.

## Optional AI configuration

Create or edit `.env.local` at the root:

```dotenv
OPENROUTER_API_KEY=replace_with_your_key
```

Keep the key server-side. Do not prefix it with `VITE_`, put it in a workflow input, or include it in documentation. `.env.local` is ignored. The Vite middleware loads environment values when handling requests; the browser never receives the key.

OpenRouter mode requests `openrouter/free`, with no paid fallback configured. The router chooses the actual model. `GET /api/ai-status` reports whether a non-empty key is configured, not whether it is valid. Simulated mode needs no key but does not execute custom AI instructions.

## Network and storage

- PDF extraction uses a bundled browser worker.
- Crossref lookup and live OpenRouter need network access.
- CSS loads Google Fonts; system fonts are fallbacks.
- Drafts depend on browser profile and exact origin. `localhost` and `127.0.0.1` have separate storage.

See [troubleshooting](TROUBLESHOOTING.md) and [security and data](SECURITY-AND-DATA.md).
