import javascriptSource from "../../workers/javascriptWorker.js?raw";
import pythonSource from "../../workers/pythonWorker.js?raw";

const jsonForScript = value => JSON.stringify(value).replace(/</g, "\\u003c");
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.6/full/";

// Workers normally share the application's origin and IndexedDB. Creating them
// in this sandbox prevents student code from reading Firebase auth persistence.
export function runIsolated(language, code, onState, { executionMs = 5000, startupMs = 60000 } = {}) {
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Isolated code execution";
  frame.sandbox = "allow-scripts";
  frame.referrerPolicy = "no-referrer";
  const runtime = language === "python" ? PYODIDE_URL : "";
  const csp = `default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: ${runtime}; worker-src blob:; connect-src ${runtime || "'none'"}; base-uri 'none'; form-action 'none';`;
  const source = language === "python" ? pythonSource : javascriptSource;
  frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="${csp}"><script>
    const worker = new Worker(URL.createObjectURL(new Blob([${jsonForScript(source)}], {type: 'text/javascript'})), {type: 'module'});
    worker.onmessage = e => parent.postMessage(e.data, '*');
    worker.onerror = event => parent.postMessage({type: 'init-error', error: event.message}, '*');
    addEventListener('message', e => {
      if (e.source !== parent) return;
      if (e.data.type === 'stop') worker.terminate();
      else if (e.data.type === 'run') worker.postMessage(e.data);
    });
  </script>`;
  let finish;
  const promise = new Promise(resolve => {
    let settled = false;
    let started = false;
    let timer;
    finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      window.removeEventListener("message", receive);
      frame.contentWindow?.postMessage({ type: "stop" }, "*");
      frame.remove();
      resolve(result);
    };
    const receive = event => {
      if (event.source !== frame.contentWindow || event.origin !== "null") return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "ready" && !started) {
        started = true;
        clearTimeout(timer);
        timer = setTimeout(() => finish({ ok: false, output: "", errorCode: "timeout" }), executionMs);
        onState("running");
        frame.contentWindow.postMessage({ type: "run", code }, "*");
      } else if (data.type === "init-error" && !started) {
        finish({ ok: false, output: "", errorCode: "initialization", error: String(data.error || "").slice(0, 4000) });
      } else if (data.type === "result" && started) {
        finish({ ok: data.ok === true, output: String(data.output || "").slice(0, 64000), error: String(data.error || "").slice(0, 64000) });
      }
    };
    window.addEventListener("message", receive);
    timer = setTimeout(() => finish({ ok: false, output: "", errorCode: "initialization" }), startupMs);
    onState(language === "python" ? "initializing" : "running");
    document.body.append(frame);
  });
  return { promise, cancel: () => finish({ ok: false, output: "", errorCode: "stopped" }) };
}
