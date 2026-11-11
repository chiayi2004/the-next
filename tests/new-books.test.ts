import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {whaleBoy} from '../src/data/books/whale-boy/index.ts';
import {lemonCandy} from '../src/data/books/lemon-candy/index.ts';
import {books} from '../src/data/books.ts';
import {tags} from '../src/data/tags.ts';
import {paginate} from './helpers/paginate-with-character-budget.ts';

test('兩本新作均使用預設筆名，寫作日期明確為未知，完整沿用既有書庫',()=>{
 assert.equal(books.length,4);
 assert.equal(new Set(books.map(book=>book.id)).size,books.length);
 assert.equal(new Set(books.map(book=>book.slug)).size,books.length);
 assert.deepEqual(books.map(book=>book.shelfOrder),[1,2,3,4]);
 for(const book of [whaleBoy,lemonCandy]){
  assert.equal(book.author,'木頭人');assert.equal(book.writtenAt,null);
  assert.equal(book.hasChapters,false);assert.equal(book.demo,false);
  assert.ok(book.tags.length>=1&&book.tags.length<=5);
  assert.ok(book.tags.includes(book.primaryTag));assert.ok(book.tags.every(tag=>tags[tag]));
 }
});
test('兩篇正文與 PDF 匯入記錄一致，分頁後文字、段落與場景分隔完整還原',()=>{
 for(const [book,slug,pageCount] of [[whaleBoy,'whale-boy',8],[lemonCandy,'lemon-candy',17]] as const){
  const root=new URL(`../src/data/books/${slug}/`,import.meta.url);
  const content=readFileSync(new URL('content.txt',root),'utf8');
  const manifest=JSON.parse(readFileSync(new URL('source-manifest.json',root),'utf8'));
  assert.equal(manifest.sourcePages,pageCount);assert.equal(manifest.writtenAt,null);
  assert.equal(createHash('sha256').update(content).digest('hex'),manifest.contentSha256);
  assert.equal(book.chapters[0].content,content);
  for(const capacity of [70,150,260])assert.equal(paginate(book,capacity).map(page=>page.content).join(''),content);
  assert.ok(content.includes('\n\n⋯⋯\n\n'));
 }
 assert.ok(whaleBoy.chapters[0].content.endsWith('男孩毫不猶豫地跟著躍入了海裡。'));
 assert.ok(lemonCandy.chapters[0].content.endsWith('她想著，忽然覺得有些好笑，於是勾起唇角，又安靜地讓淚珠滑過面頰，緩緩落下。'));
});
