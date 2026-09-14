import { useEffect, useRef } from "react";
import { useCodeText } from "./codeText";

const scriptString = value => JSON.stringify(value).replace(/</g, "\\u003c");
function webDocument(code) {
  const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"><script>
    const report = error => parent.postMessage({ type: 'web-error', error: String(error).slice(0, 4000) }, '*');
    addEventListener('error', e => report(e.message));
    addEventListener('unhandledrejection', e => report(e.reason));
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = ${scriptString(code.css)}; document.head.append(style);
      try { (0, eval)(${scriptString(code.javascript)}); } catch (error) { report(error); }
    });
  </script></head><body>${code.html}</body></html>`;
}
export default function WebPreview({ project, onError }) {
  const { text } = useCodeText();
  const frame = useRef(null);
  useEffect(() => {
    const receive = event => {
      if (event.source === frame.current?.contentWindow && event.origin === "null" && event.data?.type === "web-error") onError(String(event.data.error).slice(0, 4000));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onError]);
  return <section className="code-preview"><h3>{text("preview")}</h3>{project ? <iframe ref={frame} title={text("preview")} sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={webDocument(project)} /> : <p>{text("idle")}</p>}<small>{text("webNote")}</small></section>;
}
