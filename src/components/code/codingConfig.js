export const CODE_LIMIT = 50000;
export const languages = ["python", "javascript", "web"];
export const defaultCode = {
  python: 'print("Hello!")\nprint(5 + 7)\n',
  javascript: 'console.log("Hello!");\nconsole.log(5 + 7);\n',
  web: { html: '<h1>Hello!</h1>\n<button id="hello">Click me</button>', css: 'body { font-family: sans-serif; padding: 24px; color: #6840d8; }', javascript: 'document.querySelector("#hello").onclick = () => {\n  document.querySelector("h1").textContent = "Welcome!";\n};' },
};
export function isCodingConfig(config) { return Boolean(config && languages.includes(config.language)); }
export function getLessonSections(lesson) {
  const sections = Array.isArray(lesson?.sections) ? lesson.sections : [];
  if (!isCodingConfig(lesson?.codingConfig)) return sections;
  return [...sections, { id: "__lesson_coding__", type: "task", title: lesson.title, introduction: lesson.description, codingConfig: lesson.codingConfig }];
}
export function starterFor(config, saved) {
  const starter = saved ?? config.starterCode ?? defaultCode[config.language];
  if (config.language !== "web") return typeof starter === "string" ? starter.slice(0, CODE_LIMIT) : "";
  let value = starter;
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { value = { html: value }; }
  }
  return Object.fromEntries(["html", "css", "javascript"].map(key => [key, typeof value?.[key] === "string" ? value[key].slice(0, CODE_LIMIT) : ""]));
}
export function normalizeOutput(value) { return String(value).replace(/\r\n?/g, "\n").replace(/\n+$/, ""); }
export function checkOutput(config, output) {
  if (config.language === "web" || typeof config.expectedOutput !== "string") return null;
  return normalizeOutput(output) === normalizeOutput(config.expectedOutput);
}
