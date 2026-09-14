// Executed only in a dedicated worker belonging to an opaque sandbox origin.
const send = self.postMessage.bind(self);
self.onmessage = async ({ data }) => {
  if (data.type !== "run") return;
  let output = "";
  let errors = "";
  const format = value => {
    if (typeof value === "string") return value;
    try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
  };
  const write = (values, error = false) => {
    const line = values.map(format).join(" ") + "\n";
    if (output.length + errors.length + line.length > 64000) throw new Error("Output limit exceeded (64 KB).");
    if (error) errors += line; else output += line;
  };
  try {
    send({ type: "running" });
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    const studentConsole = Object.freeze({ log: (...v) => write(v), info: (...v) => write(v), warn: (...v) => write(v, true), error: (...v) => write(v, true), clear: () => { output = ""; errors = ""; } });
    await new AsyncFunction("console", '"use strict";\n' + data.code)(studentConsole);
    send({ type: "result", output, error: errors, ok: !errors });
  } catch (error) {
    send({ type: "result", output, error: (errors + String(error?.stack || error)).slice(0, 64000), ok: false });
  }
};
send({ type: "ready" });
