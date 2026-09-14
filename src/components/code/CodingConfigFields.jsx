import { defaultCode, starterFor, CODE_LIMIT } from "./codingConfig";
import { useCodeText } from "./codeText";
import "./CodeRunner.css";

export default function CodingConfigFields({ value, onChange }) {
  const { text } = useCodeText();
  const enabled = Boolean(value);
  const set = patch => onChange({ ...value, ...patch });
  const starter = enabled ? starterFor(value) : "";
  return <fieldset className="coding-config-fields">
    <legend>{text("code")}</legend>
    <label className="coding-enable"><input type="checkbox" checked={enabled} onChange={event => onChange(event.target.checked ? { language: "python", starterCode: defaultCode.python } : null)} />{text("enable")}</label>
    {enabled && <>
      <label>{text("language")}<select value={value.language} onChange={event => onChange({ language: event.target.value, starterCode: defaultCode[event.target.value] })}><option value="python">Python</option><option value="javascript">JavaScript</option><option value="web">HTML / CSS / JavaScript</option></select></label>
      {value.language === "web" ? ["html", "css", "javascript"].map(key => <label key={key}>{key.toUpperCase()}<textarea dir="ltr" rows="5" maxLength={CODE_LIMIT} value={starter[key]} onChange={event => set({ starterCode: { ...starter, [key]: event.target.value } })} /></label>) : <label>{text("starter")}<textarea dir="ltr" rows="7" maxLength={CODE_LIMIT} value={starter} onChange={event => set({ starterCode: event.target.value })} /></label>}
      {value.language !== "web" && <>
        <label className="coding-enable"><input type="checkbox" checked={typeof value.expectedOutput === "string"} onChange={event => { if (event.target.checked) set({ expectedOutput: "" }); else { const next = { ...value }; delete next.expectedOutput; onChange(next); } }} />{text("validate")}</label>
        {typeof value.expectedOutput === "string" && <label>{text("expected")}<textarea dir="ltr" rows="4" maxLength={CODE_LIMIT} value={value.expectedOutput} onChange={event => set({ expectedOutput: event.target.value })} /></label>}
      </>}
      <small>{text("authorNote")}</small>
    </>}
  </fieldset>;
}
