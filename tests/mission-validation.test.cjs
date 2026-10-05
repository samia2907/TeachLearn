const test = require("node:test");
const assert = require("node:assert/strict");
const {isValidMissionCompletion} = require("../functions/missionValidation");

const sections = [
  {id: "story", type: "story"},
  {id: "choice", type: "multipleChoice", correctAnswer: "yes"},
  {id: "sequence", type: "sequence", correctOrder: ["first", "second"]},
  {
    id: "robot",
    type: "robot",
    grid: {size: 2, start: [0, 0], goal: [1, 0], obstacles: []},
  },
];

function solvedMission() {
  return {
    version: 1,
    screens: {
      story: {passed: true, answer: ""},
      choice: {passed: true, answer: "yes"},
      sequence: {passed: true, answer: ["first", "second"]},
      robot: {passed: true, answer: ["right"]},
    },
  };
}

test("accepts only source-validated mission answers", () => {
  assert.equal(isValidMissionCompletion(sections, solvedMission()), true);

  const forged = solvedMission();
  forged.screens.choice.answer = "no";
  assert.equal(isValidMissionCompletion(sections, forged), false);

  const incomplete = solvedMission();
  incomplete.screens.robot.passed = false;
  assert.equal(isValidMissionCompletion(sections, incomplete), false);
});
