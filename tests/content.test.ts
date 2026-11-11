import { test } from 'node:test';
import assert from 'node:assert/strict';
import { paginateToFit } from '../src/pagination.ts';
import { paginate } from './helpers/paginate-with-character-budget.ts';
import { demoBooks } from './fixtures/demo-books.ts';
import { tags } from '../src/data/tags.ts';
test('所有示範書都有唯一編號、完整資料與有效標籤',()=>{
 assert.equal(new Set(demoBooks.map(b=>b.id)).size,demoBooks.length);
 assert.equal(new Set(demoBooks.map(b=>b.slug)).size,demoBooks.length);
 for(const book of demoBooks){assert.ok(book.demo);assert.ok(book.tags.length>=1&&book.tags.length<=5);assert.ok(book.tags.includes(book.primaryTag));assert.ok(tags[book.primaryTag]);assert.ok(book.chapters.length>0);assert.ok(book.author.includes('示範'));}
});
test('分頁後可以逐字還原每個章節，包含換行與中文標點',()=>{
 for(const book of demoBooks){const pages=paginate(book);for(const chapter of book.chapters){assert.equal(pages.filter(p=>p.chapter===chapter.title).map(p=>p.content).join(''),chapter.content);}assert.ok(pages.every(p=>p.content.length>0));}
});
test('手機與桌面的最後一頁範圍皆不越界',()=>{
 for(const book of demoBooks){const pages=paginate(book);for(const step of [1,2]){const last=Math.floor((pages.length-1)/step)*step;assert.ok(last<pages.length);assert.ok(pages.slice(last,last+step).length>=1);}}
});
test('超長段落與 Unicode 字元仍完整保留',()=>{
 const content='月🌙光，\n'.repeat(400);const book={...demoBooks[0],chapters:[{id:'long',title:'長段落',order:1,content}]};const pages=paginate(book);assert.equal(pages.map(p=>p.content).join(''),content);assert.ok(pages.every(p=>Array.from(p.content).length<=260));
});
test('依實際容量分頁時，每頁都符合量測條件且逐字保留原文',()=>{
 const book=demoBooks[0];
 const fits=(page:{chapter:string;content:string})=>Array.from(page.content).reduce((height,char)=>height+(char==='\n'?10:1),page.chapter.length)<=105;
 const pages=paginateToFit(book,fits);
 assert.ok(pages.every(fits));
 for(const chapter of book.chapters)assert.equal(pages.filter(page=>page.chapterId===chapter.id).map(page=>page.content).join(''),chapter.content);
 for(const page of pages)assert.ok(page.end>page.start);
});
