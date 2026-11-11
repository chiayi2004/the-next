import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { confession } from '../src/data/books/confession/index.ts';
import { books } from '../src/data/books.ts';
import { tags } from '../src/data/tags.ts';
import { paginate } from './helpers/paginate-with-character-budget.ts';

test('正式作品的作者、標籤與封面主題正確，書架不再包含示範書',()=>{
 assert.equal(confession.author,'木頭人');
 assert.equal(confession.writtenAt,'2025-03-21');
 assert.equal(confession.demo,false);
 assert.equal(confession.primaryTag,'悲劇');
 assert.ok(confession.tags.length>=1&&confession.tags.length<=5);
 assert.ok(confession.tags.includes(confession.primaryTag));
 assert.ok(confession.tags.every(tag=>tags[tag]));
 assert.ok(books.some(book=>book.id===confession.id));
 assert.ok(books.every(book=>!book.demo));
 assert.equal(new Set(books.map(book=>book.id)).size,books.length);
 assert.equal(new Set(books.map(book=>book.slug)).size,books.length);
});
test('正式正文與經核對的 PDF 匯入內容完全一致，分頁後仍可逐字還原',()=>{
 const root=new URL('../src/data/books/confession/',import.meta.url);
 const original=readFileSync(new URL('content.txt',root),'utf8');
 const manifest=JSON.parse(readFileSync(new URL('source-manifest.json',root),'utf8'));
 assert.equal(manifest.sourcePages,8);
 assert.equal(createHash('sha256').update(original).digest('hex'),manifest.contentSha256);
 assert.equal(confession.chapters.map(chapter=>chapter.content).join(''),original);
 for(const limit of [70,150,260])assert.equal(paginate(confession,limit).map(page=>page.content).join(''),original);
 assert.ok(original.endsWith('『深愛你們的不合格女兒 陳曉翼 敬上』'));
});
