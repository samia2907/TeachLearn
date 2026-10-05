import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../functions/index.js', import.meta.url), 'utf8');
const start = source.indexOf('exports.joinClass =');
const end = source.indexOf('exports.leaveClass =', start);

function joinClassWithMembership(membership) {
  const context = {
    exports: {},
    onCall: (_options, handler) => handler,
    requireRole: async () => ({role: 'student'}),
    membershipId: (classId, studentId) => `${classId}_${studentId}`,
    serializeValue: value => value,
    FieldValue: {serverTimestamp: () => 'server-time'},
    HttpsError: class HttpsError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
      }
    },
    db: {
      collection: name => ({
        doc: () => ({
          get: async () => {
            if (name === 'classCodes') {
              return {exists: true, data: () => ({classId: 'class1'})};
            }
            if (name === 'classes') {
              return {exists: true, data: () => ({status: 'active', teacherId: 'teacher1'})};
            }
            return {exists: true, data: () => membership};
          },
          set: async () => {},
        }),
      }),
    },
  };
  runInNewContext(source.slice(start, end), context);
  return context.exports.joinClass;
}

test('a removed membership cannot be reactivated through the student join callable', async () => {
  await assert.rejects(
    joinClassWithMembership({status: 'removed'})({
      auth: {uid: 'student1'},
      data: {classCode: 'class-code'},
    }),
    error => error.code === 'permission-denied',
  );
});
