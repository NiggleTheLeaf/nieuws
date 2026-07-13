#!/usr/bin/env node
import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const storyDir = path.join(root, 'content', 'stories');
const outputFile = path.join(root, 'stories-data.js');
const args = new Set(process.argv.slice(2));
const required = ['id','title','dek','country','city','section','published','author','body','status'];

function validate(story, source) {
  const missing = required.filter(key => story[key] === undefined || story[key] === '');
  if (missing.length) throw new Error(`${source}: missing ${missing.join(', ')}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.id)) throw new Error(`${source}: id must be lowercase kebab-case`);
  if (!Array.isArray(story.body) || story.body.length < 2) throw new Error(`${source}: body must contain at least two paragraphs`);
  if (Number.isNaN(Date.parse(story.published))) throw new Error(`${source}: published must be an ISO date`);
  if (!['draft','published'].includes(story.status)) throw new Error(`${source}: status must be draft or published`);
}

async function bootstrap() {
  await mkdir(storyDir, { recursive: true });
  const code = await readFile(outputFile, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  const legacy = sandbox.window.MOPANE_STORIES || [];
  const base = Date.parse('2026-07-12T12:00:00Z');
  for (const [index, item] of legacy.entries()) {
    const story = {
      ...item,
      published: item.published || new Date(base - index * 60 * 60 * 1000).toISOString(),
      updated: item.updated || new Date(base - index * 60 * 60 * 1000).toISOString(),
      status: item.status || 'published',
      sources: item.sources || []
    };
    const target = path.join(storyDir, `${story.id}.json`);
    try { await access(target); } catch { await writeFile(target, JSON.stringify(story, null, 2) + '\n', 'utf8'); }
  }
  console.log(`Bootstrapped ${legacy.length} story files.`);
}

async function loadStories() {
  await mkdir(storyDir, { recursive: true });
  const files = (await readdir(storyDir)).filter(file => file.endsWith('.json')).sort();
  const stories = [];
  const ids = new Set();
  for (const file of files) {
    const parsed = JSON.parse(await readFile(path.join(storyDir, file), 'utf8'));
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const story of items) {
      validate(story, file);
      if (ids.has(story.id)) throw new Error(`${file}: duplicate id ${story.id}`);
      ids.add(story.id);
      stories.push(story);
    }
  }
  return stories.sort((a,b) => Date.parse(b.published) - Date.parse(a.published));
}

const validateFileIndex = process.argv.indexOf('--validate-file');
if (validateFileIndex >= 0) {
  const target = process.argv[validateFileIndex + 1];
  if (!target) throw new Error('--validate-file requires a JSON path');
  const parsed = JSON.parse(await readFile(path.resolve(target), 'utf8'));
  const items = Array.isArray(parsed) ? parsed : [parsed];
  items.forEach(story => validate(story, target));
  console.log(`Validated ${items.length} draft ${items.length === 1 ? 'story' : 'stories'}.`);
  process.exit(0);
}

if (args.has('--bootstrap')) await bootstrap();
const allStories = await loadStories();
const published = allStories.filter(story => story.status === 'published');
if (!args.has('--check')) {
  await writeFile(outputFile, `window.MOPANE_STORIES = ${JSON.stringify(published, null, 2)};\n`, 'utf8');
}
console.log(`${args.has('--check') ? 'Validated' : 'Built'} ${published.length} published stories (${allStories.length - published.length} drafts excluded).`);
