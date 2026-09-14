// Loaded as a module worker inside the opaque-origin runner frame.
const send = self.postMessage.bind(self);
let pyodide;
try {
  const { loadPyodide } = await import("https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.mjs");
  pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.6/full/" });
  pyodide.setStdin({ error: true });
  send({ type: "ready" });
} catch (error) {
  send({ type: "init-error", error: String(error) });
}
self.onmessage = async ({ data }) => {
  if (data.type !== "run" || !pyodide) return;
  let output = "";
  let errors = "";
  const decoder = new TextDecoder();
  const write = (bytes, error = false) => {
    const value = decoder.decode(bytes);
    if (output.length + errors.length + value.length > 64000) throw new Error("Output limit exceeded (64 KB).");
    if (error) errors += value; else output += value;
    return bytes.length;
  };
  pyodide.setStdout({ write: bytes => write(bytes) });
  pyodide.setStderr({ write: bytes => write(bytes, true) });
  try {
    send({ type: "running" });
    await pyodide.runPythonAsync(data.code);
    send({ type: "result", output, error: errors, ok: !errors });
  } catch (error) {
    send({ type: "result", output, error: (errors + String(error)).slice(0, 64000), ok: false });
  }
};
