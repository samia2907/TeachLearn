import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import images from '../src/utils/lessonImageManifest.json' with { type: 'json' };
import { lessonImageUrl, lessonImageDimensions } from '../src/utils/lessonImages.js';

test('all eight optimized covers exist, retain dimensions, and are smaller than originals', async () => {
  assert.equal(Object.keys(images).length, 8);
  for (const [source, entry] of Object.entries(images)) {
    const original = await readFile(new URL(`../public${source}`, import.meta.url));
    assert.equal(original.length, entry.originalBytes);
    assert.deepEqual(lessonImageDimensions(source), {
      width: original.readUInt32BE(16), height: original.readUInt32BE(20),
    });
    for (const kind of ['full', 'thumbnail']) {
      const data = await readFile(new URL(`../public${entry[kind]}`, import.meta.url));
      assert.equal(data.toString('ascii', 0, 4), 'RIFF');
      assert.equal(data.toString('ascii', 8, 12), 'WEBP');
      assert.equal(data.length, entry[`${kind}Bytes`]);
      assert.ok(data.length < original.length);
      assert.ok(entry[kind].includes(createHash('sha256').update(data).digest('hex').slice(0, 12)));
      assert.equal(lessonImageUrl(source, kind === 'thumbnail'), entry[kind]);
    }
  }
});

test('remote, signed, unknown, and absent sources are never rewritten or given invented dimensions', () => {
  for (const source of [undefined, null, '', '/lesson-covers/new.png',
    '/lesson-covers/inside-a-computer.png?v=2',
    'https://firebasestorage.googleapis.com/v0/b/example/o/image.png?alt=media&token=private',
    'https://example.com/lesson-covers/inside-a-computer.png', 'data:image/png;base64,abc']) {
    assert.equal(lessonImageUrl(source), source);
    assert.equal(lessonImageUrl(source, true), source);
    assert.deepEqual(lessonImageDimensions(source), {});
  }
});
