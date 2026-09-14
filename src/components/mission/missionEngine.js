export const MISSION_VERSION = 1;

export const DIRECTIONS = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

export const screenTypes = [
  'story',
  'explain',
  'multipleChoice',
  'sequence',
  'robot',
  'debugging',
];

export function validateMission(sections) {
  if (!Array.isArray(sections) || !sections.length) return false;

  const ids = new Set();

  return sections.every(s => {
    if (!s.id || ids.has(s.id) || !screenTypes.includes(s.type)) {
      return false;
    }

    ids.add(s.id);

    if (s.type === 'explain') {
      const body = s.body ?? s.text ?? '';

      return Boolean(
        s.title &&
        (
          typeof body === 'string' ||
          (body && typeof body === 'object')
        )
      );
    }

    if (s.type === 'multipleChoice') {
      return (
        Array.isArray(s.options) &&
        s.options.some(o => o.id === s.correctAnswer)
      );
    }

    if (s.type === 'sequence') {
      return (
        s.items?.length > 1 &&
        s.correctOrder?.length === s.items.length &&
        new Set(s.correctOrder).size === s.items.length &&
        s.correctOrder.every(id =>
          s.items.some(i => i.id === id)
        )
      );
    }

    if (['robot', 'debugging'].includes(s.type)) {
      const point = p =>
        Array.isArray(p) &&
        p.length === 2 &&
        p.every(
          n =>
            Number.isInteger(n) &&
            n >= 0 &&
            n < s.grid.size
        );

      return (
        Number.isInteger(s.grid?.size) &&
        s.grid.size > 1 &&
        s.grid.size <= 8 &&
        point(s.grid.start) &&
        point(s.grid.goal) &&
        Array.isArray(s.grid.obstacles) &&
        s.grid.obstacles.every(point) &&
        (
          s.type !== 'debugging' ||
          (
            Array.isArray(s.commands) &&
            s.commands.length > 0 &&
            s.commands.length <= 32 &&
            s.commands.every(c =>
              Object.hasOwn(DIRECTIONS, c)
            )
          )
        )
      );
    }

    return true;
  });
}

export function initialAnswer(screen) {
  if (screen.type === 'sequence') {
    return screen.items.map(item => item.id);
  }

  if (screen.type === 'debugging') {
    return [...screen.commands];
  }

  if (screen.type === 'robot') {
    return [];
  }

  return '';
}

export function runRobot(grid, commands) {
  let [x, y] = grid.start;
  const path = [[x, y]];

  if (!Array.isArray(commands) || commands.length > 32) {
    return {
      correct: false,
      path,
      error: 'invalid',
    };
  }

  for (const command of commands) {
    const delta = DIRECTIONS[command];

    if (!delta) {
      return {
        correct: false,
        path,
        error: 'invalid',
      };
    }

    const nx = x + delta[0];
    const ny = y + delta[1];

    if (
      nx < 0 ||
      ny < 0 ||
      nx >= grid.size ||
      ny >= grid.size ||
      grid.obstacles?.some(
        ([ox, oy]) => ox === nx && oy === ny
      )
    ) {
      return {
        correct: false,
        path,
        error: 'blocked',
      };
    }

    [x, y] = [nx, ny];
    path.push([x, y]);
  }

  return {
    correct:
      x === grid.goal[0] &&
      y === grid.goal[1],
    path,
    error: '',
  };
}

export function checkAnswer(screen, answer) {
  switch (screen.type) {
    case 'story':
    case 'explain':
      return true;

    case 'multipleChoice':
      return answer === screen.correctAnswer;

    case 'sequence':
      return (
        Array.isArray(answer) &&
        answer.length === screen.correctOrder.length &&
        answer.every(
          (id, index) =>
            id === screen.correctOrder[index]
        )
      );

    case 'robot':
    case 'debugging':
      return runRobot(screen.grid, answer).correct;

    default:
      return false;
  }
}

export function newProgress(sections) {
  return {
    version: MISSION_VERSION,
    currentScreen: 0,

    screens: Object.fromEntries(
      sections.map(s => [
        s.id,
        {
          answer: initialAnswer(s),
          attempts: 0,
          hintsUsed: 0,
          passed: false,
          checked: false,
        },
      ])
    ),

    skills: {},
  };
}

function safeAnswer(screen, value) {
  if (screen.type === 'sequence') {
    return (
      Array.isArray(value) &&
      value.length === screen.items.length &&
      new Set(value).size === value.length &&
      value.every(id =>
        screen.items.some(item => item.id === id)
      )
        ? value
        : initialAnswer(screen)
    );
  }

  if (screen.grid) {
    return (
      Array.isArray(value) &&
      value.length <= 32 &&
      value.every(c =>
        Object.hasOwn(DIRECTIONS, c)
      ) &&
      (
        screen.type !== 'debugging' ||
        value.length === screen.commands.length
      )
        ? value
        : initialAnswer(screen)
    );
  }

  return (
    typeof value === 'string' &&
    value.length <= 100
      ? value
      : initialAnswer(screen)
  );
}

const safeCount = value =>
  Number.isInteger(value) && value > 0
    ? Math.min(value, 10000)
    : 0;

export function skillProgress(sections, screens) {
  const skills = {};

  for (const screen of sections) {
    for (const skill of screen.skills || []) {
      skills[skill] ??= {
        passed: 0,
        total: 0,
      };

      skills[skill].total += 1;

      if (screens[screen.id]?.passed) {
        skills[skill].passed += 1;
      }
    }
  }

  return skills;
}

// Revalidate cached answers;
// merge solved screens monotonically across tabs.
export function mergeProgress(
  sections,
  remote,
  local
) {
  const result = newProgress(sections);

  for (const screen of sections) {
    const a =
      remote?.version === MISSION_VERSION
        ? remote.screens?.[screen.id]
        : null;

    const b =
      local?.version === MISSION_VERSION
        ? local.screens?.[screen.id]
        : null;

    const passed = entry =>
      Boolean(
        entry?.passed &&
        checkAnswer(screen, entry.answer)
      );

    const chosen = passed(a)
      ? a
      : passed(b)
        ? b
        : b || a;

    if (chosen) {
      result.screens[screen.id] = {
        answer: safeAnswer(
          screen,
          chosen.answer
        ),

        attempts: Math.max(
          safeCount(a?.attempts),
          safeCount(b?.attempts)
        ),

        hintsUsed: Math.min(
          screen.hints?.length || 0,
          Math.max(
            safeCount(a?.hintsUsed),
            safeCount(b?.hintsUsed)
          )
        ),

        checked: Boolean(chosen.checked),
        passed: passed(chosen),
      };
    }
  }

  const firstUnsolved = sections.findIndex(
    s => !result.screens[s.id].passed
  );

  const unlocked =
    firstUnsolved < 0
      ? sections.length - 1
      : firstUnsolved;

  const requested =
    local?.currentScreen ??
    remote?.currentScreen ??
    0;

  result.currentScreen =
    Number.isInteger(requested)
      ? Math.max(
          0,
          Math.min(requested, unlocked)
        )
      : 0;

  result.skills = skillProgress(
    sections,
    result.screens
  );

  return result;
}

export const missionReady = (
  sections,
  progress
) =>
  sections.length > 0 &&
  sections.every(
    s =>
      progress.screens[s.id]?.passed &&
      checkAnswer(
        s,
        progress.screens[s.id].answer
      )
  );

export function updateScreen(
  sections,
  progress,
  changes
) {
  const screen =
    sections[progress.currentScreen];

  const screens = {
    ...progress.screens,

    [screen.id]: {
      ...progress.screens[screen.id],
      ...changes,
    },
  };

  return {
    ...progress,
    screens,
    skills: skillProgress(
      sections,
      screens
    ),
  };
}