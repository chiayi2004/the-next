import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { summerFestival } from '../src/data/books/summer-festival/index.ts';
import { confession } from '../src/data/books/confession/index.ts';
import { DEFAULT_AUTHOR } from '../src/data/defaults.ts';
import { tags } from '../src/data/tags.ts';
import { getPageHeading, paginateToFit } from '../src/pagination.ts';
import { paginate } from './helpers/paginate-with-character-budget.ts';

test('新作品使用預設筆名與指定寫作日期，標籤均存在於統一資料',()=>{
 assert.equal(summerFestival.author,DEFAULT_AUTHOR);
 assert.equal(summerFestival.writtenAt,'2023-03-31');
 assert.equal(summerFestival.hasChapters,false);
 assert.equal(summerFestival.primaryTag,'成長');
 assert.equal(summerFestival.tags.length,5);
 assert.ok(summerFestival.tags.every(tag=>tags[tag]));
});
test('新作品原文與九頁 PDF 匯入紀錄一致，分頁不遺失字元',()=>{
 const root=new URL('../src/data/books/summer-festival/',import.meta.url);
 const original=readFileSync(new URL('content.txt',root),'utf8');
 const manifest=JSON.parse(readFileSync(new URL('source-manifest.json',root),'utf8'));
 assert.equal(manifest.sourcePages,9);
 assert.equal(createHash('sha256').update(original).digest('hex'),manifest.contentSha256);
 assert.equal(summerFestival.chapters[0].content,original);
 assert.equal(paginate(summerFestival,150).map(page=>page.content).join(''),original);
 assert.ok(original.endsWith('夏天賦予他生命，夏天賦予他死亡。'));
});
test('未分章的兩本作品只在第一頁顯示書名，不顯示全文標題',()=>{
 for(const book of [summerFestival,confession]){
  const pages=paginate(book,100);
  assert.equal(getPageHeading(book,pages[0]),book.title);
  assert.ok(pages.slice(1).every(page=>getPageHeading(book,page)===''));
 }
});
test('分章作品只在各章首頁顯示章名，正文容量不包含標題',()=>{
 const book={...summerFestival,hasChapters:true,chapters:[{id:'one',title:'第一章',order:1,content:'甲'.repeat(210)},{id:'two',title:'第二章',order:2,content:'乙'.repeat(210)}]};
 const pages=paginateToFit(book,page=>Array.from(page.content).length<=100);
 assert.deepEqual(pages.filter(page=>getPageHeading(book,page)).map(page=>getPageHeading(book,page)),['第一章','第二章']);
 assert.equal(pages[0].content.length,100);
 assert.equal(pages[1].content.length,100);
 assert.equal(pages.map(page=>page.content).join(''),book.chapters.map(chapter=>chapter.content).join(''));
});
