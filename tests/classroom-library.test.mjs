import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { classroomLessons, programs } from '../functions/content/catalog.js';

const sourceUrl = new URL('../src/pages/TeacherLessons.jsx', import.meta.url);
const source = readFileSync(sourceUrl, 'utf8');
const missions = Object.fromEntries(await Promise.all(
  [...source.matchAll(/import (mission\d+) from "([^\"]+)"/g)].map(async ([, name, path]) => [name, (await import(new URL(path, sourceUrl))).default]),
));
const library = runInNewContext(source.match(/const libraryLessons = (\[[^;]+\]);/)[1], { ...missions, classroomLessons });

test('the four catalog classroom lessons retain every field and stable ID', () => {
  const expected = {
    'tech-ai-intro-01': 'd7ceb303741403698a402026e91f6ee8d3e3d9b5e121f5286362607799e34efe',
    'tech-computer-how-it-works-02': 'e36793cd5dd1c43cc341cd263d29f1d467e3792cc759045964d279790ff2bd61',
    'tech-how-internet-works-03': '6f8ca6300390cab73a97a0b9b74fc19aaf4220f7fe7c5ec2e86b6e849d28817b',
    'tech-internet-safety-04': '9cb34df5b3bfe82c2397f413993763eee2d9b13077ebe4acc28ea22252545cc1',
  };
  assert.equal(classroomLessons.length, 4);
  for (const lesson of classroomLessons) {
    assert.equal(createHash('sha256').update(JSON.stringify(lesson)).digest('hex'), expected[lesson.id]);
    for (const language of ['en', 'ar', 'he']) assert.ok(lesson.title[language]);
  }
});

test('the library keeps all six direct mission objects and four classroom lessons in order', () => {
  assert.equal(library.length, 10);
  assert.equal(new Set(library.map(lesson => lesson.id)).size, 10);
  Object.values(missions).forEach((mission, index) => assert.equal(library[index], mission));
  classroomLessons.forEach((lesson, index) => assert.equal(library[index + 6], lesson));
});

test('teacher publishing preserves IDs, translated metadata and exact sections; duplicates remain blocked', async () => {
  const publishSource = source.slice(source.indexOf('  const publishTemplate ='), source.indexOf('  const createCustomLesson ='));
  for (const language of ['en', 'ar', 'he']) {
    for (const selectedTemplate of library) {
      const writes = [], errors = [];
      const context = {
        selectedTemplate, libraryClassId: 'class-1', lessons: [], db: {}, console,
        auth: { currentUser: { uid: 'teacher-1' } },
        getClass: () => ({ id: 'class-1', name: 'Class', classCode: 'ABC', learningTrack: 'techExplorer', grade: '5' }),
        localized: value => typeof value === 'string' ? value : value?.[language] || value?.en || '',
        text: value => value, navigate: () => assert.fail('Unexpected redirect'),
        collection: (_db, name) => name, serverTimestamp: () => 'timestamp',
        addDoc: async (collection, document) => writes.push({ collection, document }),
        setError: error => errors.push(error), setSuccess() {}, setPublishingTemplate() {},
        setSelectedTemplate() {}, setLibraryClassId() {}, setActiveTab() {},
      };
      runInNewContext(publishSource + '\nthis.publish = publishTemplate;', context);
      await context.publish();
      assert.equal(writes.length, 1);
      assert.equal(writes[0].collection, 'lessons');
      assert.equal(writes[0].document.templateId, selectedTemplate.id);
      assert.equal(writes[0].document.sections, selectedTemplate.sections);
      assert.equal(writes[0].document.title, context.localized(selectedTemplate.title));
      assert.equal(writes[0].document.titleI18n, selectedTemplate.title);
      assert.equal(writes[0].document.activityType, selectedTemplate.activityType);
      context.lessons.push(writes[0].document);
      await context.publish();
      assert.equal(writes.length, 1);
      assert.ok(errors.at(-1).includes('already added'));
    }
  }
});

test('the CommonJS catalog importer retains its program exports and deterministic document IDs', () => {
  const require = createRequire(import.meta.url);
  const catalog = require('../functions/content/catalog.js');
  assert.equal(catalog.programs, programs);
  const { validateCatalog } = require('../functions/scripts/importCatalog.js');
  assert.deepEqual(validateCatalog(), []);
});
