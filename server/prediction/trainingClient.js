import { spawn } from "node:child_process";
import { join } from "node:path";

const providerScript = join(process.cwd(), "ml", "prediction_service", "app.py");
const DEFAULT_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 2_000_000;

function providerError(message, code = "TRAINING_PROVIDER_FAILED") {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function parseTrainingProviderOutput(output, exitCode) {
  let result;
  try {
    result = JSON.parse(output);
  } catch {
    throw providerError("The local training provider returned an unreadable response.");
  }
  if (exitCode !== 0 || result?.status !== "succeeded") {
    throw providerError(result?.error || "The local training provider could not complete the run.");
  }
  if (!Array.isArray(result.baselines) || !Array.isArray(result.candidates) || !result.recommendation) {
    throw providerError("The local training provider response is incomplete.");
  }
  return result;
}

export function runTrainingProvider(payload, {
  pythonCommand = process.env.PREDICTION_PYTHON || (process.platform === "win32" ? "python" : "python3"),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  spawnProcess = spawn,
} = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnProcess(/* turbopackIgnore: true */ pythonCommand, [providerScript], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });
    let stdout = "";
    let outputTooLarge = false;
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(reject, providerError("The local training provider timed out.", "TRAINING_PROVIDER_TIMEOUT"));
    }, timeoutMs);

    child.on("error", () => {
      finish(reject, providerError("The local Python training provider is unavailable.", "TRAINING_PROVIDER_UNAVAILABLE"));
    });
    child.stdout.on("data", (chunk) => {
      if (outputTooLarge) return;
      stdout += chunk.toString("utf8");
      if (Buffer.byteLength(stdout) > MAX_OUTPUT_BYTES) {
        outputTooLarge = true;
        child.kill();
      }
    });
    child.stderr.on("data", () => {});
    child.stdin.on("error", () => {
      finish(reject, providerError("The local Python training provider closed before reading the request."));
    });
    child.on("close", (code) => {
      if (outputTooLarge) {
        finish(reject, providerError("The local training provider response exceeded the safe output limit."));
        return;
      }
      try {
        finish(resolve, parseTrainingProviderOutput(stdout, code));
      } catch (error) {
        finish(reject, error);
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}
