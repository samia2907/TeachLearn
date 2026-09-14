import { useEffect, useId, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import "./monacoSetup";
import { checkOutput, CODE_LIMIT, starterFor } from "./codingConfig";
import { runIsolated } from "./isolatedRunner";
import { useCodeText } from "./codeText";
import WebPreview from "./WebPreview";
import "./CodeRunner.css";

// Key this component by lesson/section so state never leaks between challenges.
export default function CodeRunner({ config, initialCode, onResult, onEdit, xpReward = 0 }) {
  const { language, text } = useCodeText();
  const id = useId();
  const [code, setCode] = useState(() => starterFor(config, initialCode));
  const [tab, setTab] = useState("html");
  const [state, setState] = useState("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [correct, setCorrect] = useState(null);
  const [preview, setPreview] = useState(null);
  const active = useRef({ job: null });
  const generation = useRef(0);
  const mounted = useRef(true);
  const web = config.language === "web";
  const busy = state === "running" || state === "initializing" || state === "saving";
  useEffect(() => {
    mounted.current = true;
    const session = active.current;
    return () => { mounted.current = false; session.job?.cancel(); };
  }, []);
  const clear = () => { setOutput(""); setError(""); setErrorCode(""); setCorrect(null); };
  const update = value => {
    setCode(web ? { ...code, [tab]: (value || "").slice(0, CODE_LIMIT) } : (value || "").slice(0, CODE_LIMIT));
    setCorrect(null);
    onEdit?.();
  };
  const reset = () => {
    generation.current++;
    active.current.job?.cancel();
    active.current.job = null;
    setCode(starterFor(config)); setState("idle"); setPreview(null); clear(); onEdit?.();
  };
  const run = async () => {
    if (busy) return;
    const runId = ++generation.current;
    clear();
    setState(web ? "saving" : config.language === "python" ? "initializing" : "running");
    let result;
    if (web) {
      setPreview({ ...code });
      result = { ok: true, output: "" };
    } else {
      active.current.job = runIsolated(config.language, code, setState);
      result = await active.current.job.promise;
      active.current.job = null;
    }
    if (!mounted.current || generation.current !== runId) return;
    setOutput(result.output || ""); setError(result.error || ""); setErrorCode(result.errorCode || "");
    const checked = result.ok ? checkOutput(config, result.output) : null;
    setCorrect(checked);
    setState("saving");
    try {
      await onResult?.({ code: web ? JSON.stringify(code) : code, language: config.language, passed: result.ok && checked !== false, checked });
    } catch {
      if (mounted.current && generation.current === runId) setErrorCode("savingError");
    } finally {
      if (mounted.current && generation.current === runId) setState("done");
    }
  };
  return <section className="code-runner" dir={language === "en" ? "ltr" : "rtl"} aria-labelledby={`${id}-title`}>
    <header className="code-runner-header"><h3 id={`${id}-title`}>{text("code")} <span dir="ltr">{web ? "HTML / CSS / JavaScript" : config.language === "python" ? "Python" : "JavaScript"}</span></h3>{xpReward > 0 && <span className="code-xp">⭐ {xpReward} XP</span>}</header>
    <div className={web ? "code-workspace web-workspace" : "code-workspace"}>
      <div className="code-editor-column">
        {web && <div className="code-tabs" aria-label={text("language")}>{["html", "css", "javascript"].map(item => <button type="button" key={item} aria-pressed={tab === item} onClick={() => setTab(item)}>{item === "javascript" ? "JavaScript" : item.toUpperCase()}</button>)}</div>}
        <div className="code-editor" dir="ltr">
          <Editor height="330px" language={web ? tab : config.language} theme="vs-dark" value={web ? code[tab] : code} onChange={update} loading={<p>{text("editorLoading")}</p>} options={{ minimap: { enabled: false }, fontSize: 15, tabSize: 4, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, readOnly: busy, ariaLabel: text("code"), padding: { top: 14 }, fixedOverflowWidgets: true }} />
        </div>
      </div>
      {web && <WebPreview project={preview} onError={setError} />}
    </div>
    <div className="code-actions">
      <button className="code-run" type="button" onClick={run} disabled={busy}>▶ {busy ? text(state === "initializing" ? "initializing" : "running") : text("run")}</button>
      {(state === "running" || state === "initializing") && <button type="button" onClick={() => active.current.job?.cancel()}>■ {text("stop")}</button>}
      <button type="button" onClick={reset} disabled={state === "saving"}>↻ {text("reset")}</button>
      <button type="button" onClick={clear} disabled={busy}>{text("clear")}</button>
    </div>
    <div className="code-feedback" aria-live="polite" aria-atomic="true">
      {!web && <><h4>{text("output")}</h4><pre dir="ltr">{output || (state === "done" ? text("noOutput") : text("idle"))}</pre></>}
      {(error || errorCode) && <div className="code-error" role="alert"><h4>{text("error")}</h4>{errorCode && <p>{text(errorCode)}</p>}{error && <pre dir="ltr">{error}</pre>}</div>}
      {correct !== null && <p className={correct ? "code-correct" : "code-incorrect"}>{correct ? "✓ " + text("correct") : text("incorrect")}</p>}
    </div>
    {xpReward > 0 && <small className="code-reward-note">{text("completeToEarn")}</small>}
  </section>;
}
