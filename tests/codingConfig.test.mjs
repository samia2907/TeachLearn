import test from "node:test";
import assert from "node:assert/strict";
import { getLessonSections, starterFor, checkOutput, CODE_LIMIT } from "../src/components/code/codingConfig.js";

test("ordinary lessons keep their exact section array", () => {
  const sections = [{ id: "old", type: "task" }];
  assert.equal(getLessonSections({ sections }), sections);
  assert.equal(getLessonSections({ sections, codingConfig: { language: "ruby" } }), sections);
});
test("lesson-level config adds a task without mutating old sections", () => {
  const sections = [{ id: "intro", type: "content" }];
  const result = getLessonSections({ sections, codingConfig: { language: "python", starterCode: "print(12)" } });
  assert.equal(sections.length, 1);
  assert.equal(result[1].type, "task");
  assert.equal(result[1].codingConfig.language, "python");
});
test("expected output ignores line-ending style and final newlines, not significant spaces", () => {
  const config = { language: "python", expectedOutput: "1\n2" };
  assert.equal(checkOutput(config, "1\r\n2\r\n"), true);
  assert.equal(checkOutput(config, "1 \n2"), false);
  assert.equal(checkOutput({ language: "javascript", expectedOutput: "" }, ""), true);
  assert.equal(checkOutput({ language: "python" }, "anything"), null);
  assert.equal(checkOutput({ language: "web", expectedOutput: "12" }, "12"), null);
});
test("starter and saved code preserve empty edits and restore all web tabs", () => {
  const config = { language: "python", starterCode: "print(12)" };
  assert.equal(starterFor(config, ""), "");
  assert.equal(starterFor(config), "print(12)");
  const web = { language: "web", starterCode: { html: "<h1>Hi</h1>", css: "h1{}", javascript: "" } };
  assert.deepEqual(starterFor(web, JSON.stringify(web.starterCode)), web.starterCode);
  assert.equal(starterFor(config, "a".repeat(CODE_LIMIT + 1)).length, CODE_LIMIT);
});
