import test from 'node:test';
import assert from 'node:assert/strict';
import { programDestination, manualAccessMode } from '../src/access/programFlow.mjs';
import { contentPresentation } from '../functions/programContent.mjs';
test('manual MVP defaults on; paid non-entitled users use access page; free and entitled users open program', () => {
  assert.equal(manualAccessMode, true);
  for (const role of ['teacher', 'student']) {
    assert.equal(programDestination({ id: 'p', role }, false), '/programs/p/access');
    assert.equal(programDestination({ id: 'p', accessType: 'unknown', role }, false), '/programs/p/access');
    assert.equal(programDestination({ id: 'p', accessType: 'class', role }, false), '/programs/p');
    assert.equal(programDestination({ id: 'p', role }, true), '/programs/p');
    assert.equal(programDestination({ id: 'p', accessType: 'paid', role }, false), '/programs/p/access');
    assert.equal(programDestination({ id: 'p', accessType: 'paid', role }, true), '/programs/p');
    assert.equal(programDestination({ id: 'p', accessType: 'free', role }, false), '/programs/p');
  }
  assert.equal(programDestination({ id: 'p', accessType: 'paid' }, false, false), '/programs/p');
});
test('missions never get lesson numbers or shift lesson order, and input remains unchanged', () => {
  const input = [{ id: 'a', order: 1 }, { id: 'm', order: 2, activityType: 'mission' }, { id: 'b', order: 3 }];
  const before = JSON.stringify(input);
  const view = contentPresentation(input);
  assert.deepEqual([...view.lessonNumbers], [['a', 1], ['b', 2]]);
  assert.deepEqual(view.groups.map(group => group.type), ['lesson', 'mission']);
  assert.equal(JSON.stringify(input), before);
});
