"use strict";

const DIRECTIONS = Object.freeze({
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
});

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function runRobot(grid, commands) {
  if (!isRecord(grid) || !Array.isArray(commands) || commands.length > 32) {
    return false;
  }

  let [x, y] = Array.isArray(grid.start) ? grid.start : [];
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(grid.size)) {
    return false;
  }

  for (const command of commands) {
    const delta = DIRECTIONS[command];
    if (!delta) return false;

    const nextX = x + delta[0];
    const nextY = y + delta[1];
    const blocked = !Array.isArray(grid.obstacles) || grid.obstacles.some(
      (point) => Array.isArray(point) && point[0] === nextX && point[1] === nextY,
    );

    if (
      nextX < 0 || nextY < 0 || nextX >= grid.size || nextY >= grid.size || blocked
    ) {
      return false;
    }

    [x, y] = [nextX, nextY];
  }

  return Array.isArray(grid.goal) && x === grid.goal[0] && y === grid.goal[1];
}

function hasCorrectAnswer(screen, answer) {
  switch (screen.type) {
    case "story":
    case "explain":
      return true;
    case "multipleChoice":
      return answer === screen.correctAnswer;
    case "sequence":
      return Array.isArray(answer)
        && Array.isArray(screen.correctOrder)
        && answer.length === screen.correctOrder.length
        && answer.every((item, index) => item === screen.correctOrder[index]);
    case "robot":
    case "debugging":
      return runRobot(screen.grid, answer);
    default:
      return false;
  }
}

function isValidMissionCompletion(sections, mission) {
  if (!Array.isArray(sections) || sections.length === 0 || sections.length > 300) {
    return false;
  }
  if (!isRecord(mission) || mission.version !== 1 || !isRecord(mission.screens)) {
    return false;
  }

  return sections.every((screen) => {
    if (!isRecord(screen) || typeof screen.id !== "string" || !screen.id) {
      return false;
    }
    const entry = mission.screens[screen.id];
    return isRecord(entry) && entry.passed === true
      && hasCorrectAnswer(screen, entry.answer);
  });
}

module.exports = {isValidMissionCompletion};
