import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isValidManualAccess } from '../functions/programAccessPolicy.mjs';

const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const start = source.indexOf('async function resolveProgramAccess');
const end = source.indexOf('// Metadata only:', start);

function resolverFixture({ memberships = [], access = {}, assignments = {} } = {}) {
  const context = {
    isValidManualAccess,
    safeId: value => String(value || '').replace(/\//g, '_').replace(/\s+/g, '_'),
    canAccessProgram: ({ program, user, purchaseAccess = false, classAccess = false }) => {
      if (!user || user.role !== 'student' || program.status !== 'published') return { hasAccess: false };
      if (program.accessType === 'free') return { hasAccess: true, source: 'free' };
      if (program.accessType === 'paid' && purchaseAccess) return { hasAccess: true, source: 'purchase' };
      if (program.accessType === 'class' && classAccess) return { hasAccess: true, source: 'class' };
      return { hasAccess: false };
    },
    db: {
      collection: name => ({
        doc: id => ({
          get: async () => {
            const data = name === 'programAccess' ? access[id] : assignments[id];
            return { exists: Boolean(data), id, data: () => data };
          },
        }),
        where: () => ({
          where: () => ({
            get: async () => ({
              docs: name === 'classMembers'
                ? memberships.map((data, index) => ({ id: `member-${index}`, data: () => data }))
                : [],
            }),
          }),
          get: async () => ({ docs: [] }),
        }),
      }),
    },
  };
  runInNewContext(`${source.slice(start, end)}; this.resolve = resolveProgramAccess;`, context);
  return context.resolve;
}

const program = { status: 'published', accessType: 'class' };
const student = { role: 'student', accountStatus: 'active', classId: 'legacy-class' };

test('a profile classId cannot bypass a missing active membership', async () => {
  const resolve = resolverFixture({
    access: {
      'class_legacy-class_program1': {
        status: 'active', programId: 'program1', classId: 'legacy-class',
      },
    },
  });

  assert.equal(await resolve('student1', 'program1', student, program), null);
});

test('an active membership enables its matching class assignment', async () => {
  const resolve = resolverFixture({
    memberships: [{ studentId: 'student1', classId: 'class2', status: 'active' }],
    assignments: {
      class2_program_program1: {
        classId: 'class2', programId: 'program1', status: 'active',
      },
    },
  });

  assert.deepEqual(
    JSON.parse(JSON.stringify(await resolve('student1', 'program1', student, program))),
    {
      id: 'class2_program_program1',
      accessType: 'class',
      classId: 'class2',
      programId: 'program1',
      status: 'active',
    },
  );
});
