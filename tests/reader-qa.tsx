import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BookReader} from '../src/components/BookReader';
import {clearReaderCache,measureReader} from '../src/reader-layout';
import {pageTextParts} from '../src/pagination';
import {summerFestival} from '../src/data/books/summer-festival/index';
import {confession} from '../src/data/books/confession/index';
import type {Book} from '../src/types/book';
import '../src/styles/main.css';

const sample=(title:string,contents:string[]):Book=>({...summerFestival,id:title,title,hasChapters:contents.length>1,chapters:contents.map((content,i)=>({id:`chapter-${i}`,title:`第 ${i+1} 章`,order:i,content}))});
const cases=[
 sample('一般短段落',[('這是第一段短文，用來確認段落自然接續。\n\n第二段接在同一頁，不強制另起新頁。\n\n').repeat(15)]),
 sample('跨多頁的單一長段落',['這是一個沒有換行的超長中文段落，應該自然跨越多頁，而且不能漏字或重複。'.repeat(250)]),
 sample('多個極短段落',[Array.from({length:100},(_,i)=>`第${i+1}段。`).join('\n\n')]),
 sample('大量中文標點',['「真的嗎？」她說：『是的！』——然而，故事還沒結束……（請繼續）【下一頁】；停頓、轉折，以及句號。'.repeat(70)]),
 sample('中英文混排',['The Next 閱讀器 uses real DOM layout. AnExtremelyLongUnbrokenEnglishWordWithoutAnySpaces1234567890。網址：https://example.test/a/long-path?q=中文&n=123，不能溢出。\n\n'.repeat(60)]),
 sample('引號與特殊符號',['「引號」『內引號』【書名】《作品》〈篇名〉——……•※★，á、👨‍👩‍👧‍👦、🇹🇼、𝄞，以及 50% & <tag>。\n'.repeat(60)]),
 sample('章節結尾與全文結尾',['第一章正文，長段落跨頁。'.repeat(80),'第二章正文。\n\n'.repeat(23),'最後一章很短，這是全文結尾。']),
 sample('奇數頁的短篇',['一頁就能放下的極短作品。']),
 summerFestival,confession,
];
function App(){
 const [selected,setSelected]=useState(0),[report,setReport]=useState<any>(null),[font,setFont]=useState(false),[large,setLarge]=useState(false);
 const run=async()=>{
  setReport(null);
  const root=document.querySelector('.reader')!;
  const slot=root.querySelector('.pagination-measure .page-body-slot') as HTMLElement;
  const body=slot.querySelector('.page-body') as HTMLElement;
  const text=body.querySelector('.page-text') as HTMLElement;
  await document.fonts.ready;
  for(let frame=0;frame<180;frame++){
   const visible=root.querySelector('.open-book')!.getBoundingClientRect();
   const measured=root.querySelector('.pagination-measure')!.getBoundingClientRect();
   const lines=Math.floor((slot.getBoundingClientRect().height+.001)/parseFloat(getComputedStyle(text).lineHeight));
   if(Math.abs(visible.height-measured.height)<.1&&root.getAttribute('aria-busy')==='false'&&root.getAttribute('data-body-lines')===String(lines))break;
   await new Promise(requestAnimationFrame);
  }
  const summaries=[];
  for(const book of cases){
   await document.fonts.load(getComputedStyle(text).font,book.chapters.map(chapter=>chapter.content).join(''));
   await document.fonts.ready;
   await new Promise(requestAnimationFrame);
   clearReaderCache(book);
   const result=measureReader(book,slot,body,text)!;
   const rows=result.pages.map(page=>{
    const write=(content:string)=>{const parts=pageTextParts({...page,content});const prefix=document.createElement('span');prefix.hidden=true;prefix.textContent=parts.prefix;const suffix=document.createElement('span');suffix.hidden=true;suffix.textContent=parts.suffix;text.replaceChildren(prefix,document.createTextNode(parts.text),suffix)};
    write(page.content);
    const height=text.getBoundingClientRect().height;
    const fits=height<=result.metrics.height+.01&&text.scrollWidth<=body.clientWidth;
    const chapter=book.chapters.find(c=>c.id===page.chapterId)!;
    const next=[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(chapter.content.slice(page.end))][0]?.segment;
    let maximal=true;if(next){write(page.content+next);maximal=text.getBoundingClientRect().height>result.metrics.height+.01||text.scrollWidth>body.clientWidth;}
    return {start:page.start,end:page.end,chapter:page.chapterId,height,fits,maximal};
   });
   const preserved=book.chapters.every(chapter=>result.pages.filter(p=>p.chapterId===chapter.id).map(p=>p.content).join('')===chapter.content);
   const contiguous=book.chapters.every(chapter=>{const pages=result.pages.filter(p=>p.chapterId===chapter.id);return pages[0].start===0&&pages.at(-1)!.end===chapter.content.length&&pages.every((p,i)=>!i||p.start===pages[i-1].end)});
   summaries.push({title:book.title,metrics:result.metrics,pages:rows.length,preserved,contiguous,allFit:rows.every(p=>p.fits),allMaximal:rows.every(p=>p.maximal),rows});
  }
  setReport({viewport:[innerWidth,innerHeight],font:getComputedStyle(text).fontFamily,fontSize:getComputedStyle(text).fontSize,fontStatus:document.fonts.status,passed:summaries.every(s=>s.preserved&&s.contiguous&&s.allFit&&s.allMaximal),cases:summaries});
 };
 const changeFont=async()=>{const face=new FontFace('Reader QA Font','local("Arial")');document.fonts.add(face);setFont(true);await face.load();await document.fonts.ready;};
 return <div className={large?'qa-scale':''}>
  <style>{`.qa-controls{position:fixed;z-index:100;top:0;left:0;display:flex;gap:8px;background:#201d19;padding:4px;font:11px sans-serif}.qa-controls button,.qa-controls select{background:#30251f;color:#eae0cb;border:1px solid #b79b6a;padding:4px}.qa-scale .page-prose{font-size:18px}.qa-report{position:fixed;z-index:101;bottom:0;left:0;max-height:24px;overflow:hidden;background:#201d19;font:9px monospace}`}</style>
  <div className="qa-controls"><select aria-label="測試文本" value={selected} onChange={e=>{setSelected(Number(e.target.value));setReport(null)}}>{cases.map((book,i)=><option key={book.id} value={i}>{book.title}</option>)}</select><button onClick={run}>執行全部案例</button><button onClick={changeFont}>載入測試字體</button><button onClick={()=>setLarge(v=>!v)}>切換字級</button></div>
  <dialog open className="book-dialog reader-dialog" style={{fontFamily:font?'Reader QA Font,serif':undefined}}><BookReader key={selected} book={cases[selected]} onClose={()=>setSelected(0)}/></dialog>
  <pre className="qa-report" data-testid={report?'qa-complete':'qa-report'}>{report?JSON.stringify(report):'尚未執行'}</pre>
 </div>;
}
createRoot(document.getElementById('qa-root')!).render(<App/>);
