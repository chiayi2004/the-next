import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { mistIslands } from '../src/data/books/mist-islands/index.ts';
import { books } from '../src/data/books.ts';
import { tags } from '../src/data/tags.ts';
import { paginate } from './helpers/paginate-with-character-budget.ts';
test('迷霧群島與書庫資料正確', () => {
  assert.equal(books.length, 5);
  assert.equal(books.filter(book => book.id === 'mist-islands').length, 1);
  assert.equal(mistIslands.author, '木頭人');
  assert.equal(mistIslands.writtenAt, '2023-12-05');
  assert.equal(mistIslands.hasChapters, true);
  assert.equal(mistIslands.status, '連載中');
  assert.equal(mistIslands.chapters.length, 4);
  assert.ok(mistIslands.tags.length >= 1 && mistIslands.tags.length <= 5);
  assert.ok(mistIslands.tags.includes(mistIslands.primaryTag));
  assert.ok(mistIslands.tags.every(tag => tags[tag]));
});
test('四章逐字與提取內容一致', () => {
 const root = new URL('../src/data/books/mist-islands/', import.meta.url);
 const manifest = JSON.parse(readFileSync(new URL('source-manifest.json',root),'utf8'));
 for(let i=0;i<4;i++){
  const ch=mistIslands.chapters[i];
  const content=readFileSync(new URL('chapter-'+String(i+1).padStart(2,'0')+'.txt',root),'utf8');
  assert.equal(ch.title,manifest.chapters[i].title);
  assert.equal(ch.content,content);
  assert.equal(createHash('sha256').update(content).digest('hex'),manifest.chapters[i].contentSha256);
  for(const capacity of [70,150,260])
    assert.equal(paginate(mistIslands,capacity).filter(p=>p.chapterId===ch.id).map(p=>p.content).join(''),content);
 }
});
