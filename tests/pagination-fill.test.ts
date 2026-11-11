import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paginateToFit,pageTextParts} from '../src/pagination.ts';
import {demoBooks} from './fixtures/demo-books.ts';

test('不再退回句號或段落邊界，每頁取量測允許的最大前綴',()=>{
 const content='甲'.repeat(70)+'。\n\n'+'乙'.repeat(240);
 const book={...demoBooks[0],chapters:[{id:'one',title:'測試',order:1,content}]};
 const pages=paginateToFit(book,page=>Array.from(page.content).length<=100);
 assert.equal(pages[0].content.length,100);
 assert.equal(pages[1].content.length,100);
 assert.equal(pages.map(page=>page.content).join(''),content);
});
test('跨頁不拆散組合字或 emoji，字元範圍連續且不遺漏',()=>{
 const content='漢a\u0301👨‍👩‍👧‍👦🇹🇼。'.repeat(80);
 const book={...demoBooks[0],chapters:[{id:'one',title:'測試',order:1,content}]};
 const pages=paginateToFit(book,page=>page.content.length<=70);
 const boundaries=new Set([...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(content)].map(s=>s.index));boundaries.add(content.length);
 assert.equal(pages.map(page=>page.content).join(''),content);
 pages.forEach((page,index)=>{assert.ok(boundaries.has(page.start)&&boundaries.has(page.end));if(index)assert.equal(pages[index-1].end,page.start)});
});
test('跨頁段落間距只折疊版面高度，原始換行仍完整保留',()=>{
 const page={chapter:'測試',chapterId:'one',start:20,end:30,content:'\n\n\n\n「下一段」'};
 const parts=pageTextParts(page);
 assert.equal(parts.prefix,'\n\n');assert.equal(parts.prefix+parts.text+parts.suffix,page.content);
 assert.ok(parts.text.startsWith('\n\n'));
 assert.equal(pageTextParts({...page,start:0}).prefix,'');
});
