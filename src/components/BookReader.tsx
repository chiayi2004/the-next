import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Book } from '../types/book';
import { getPageHeading, pageTextParts } from '../pagination';
import type { Page } from '../pagination';
import { clearReaderCache, measureReader } from '../reader-layout';
import type { ReaderMetrics } from '../reader-layout';
import '../styles/reader-pagination.css';

export function BookReader({book,onClose}:{book:Book;onClose:()=>void}) {
  const [layout,setLayout]=useState<{pages:Page[];metrics:ReaderMetrics}|null>(null);
  const [index,setIndex]=useState(0);
  const [single,setSingle]=useState(()=>matchMedia('(max-width:760px)').matches);
  const [busy,setBusy]=useState(true);
  const root=useRef<HTMLDivElement>(null);
  const slot=useRef<HTMLDivElement>(null);
  const body=useRef<HTMLDivElement>(null);
  const text=useRef<HTMLDivElement>(null);
  const probe=useRef<HTMLSpanElement>(null);
  const surface=useRef<HTMLDivElement>(null);
  const measure=useRef<HTMLDivElement>(null);
  const position=useRef<{chapterId:string;start:number}|null>(null);
  const pages=layout?.pages??[];
  const step=single?1:2;
  const last=Math.max(0,Math.floor((pages.length-1)/step)*step);
  const current=Math.min(Math.floor(index/step)*step,last);

  useLayoutEffect(()=>{
    const active=pages[current];
    if(active)position.current={chapterId:active.chapterId,start:active.start};
  },[pages,current]);

  useLayoutEffect(()=>{
    const space=slot.current,paper=body.current,content=text.current;
    if(!space||!paper||!content||!root.current)return;
    let disposed=false,ready=false,timer=0,frame=0,fontJob=0;
    const reflow=()=>{
      if(disposed||!ready||!surface.current||!measure.current||!root.current)return;
      measure.current.style.height=`${surface.current.getBoundingClientRect().height}px`;
      const next=measureReader(book,space,paper,content);
      if(!next)return;
      root.current.style.setProperty('--reader-body-height',`${next.metrics.height}px`);
      const anchor=position.current;
      const found=anchor?next.pages.findIndex(page=>page.chapterId===anchor.chapterId&&page.start<=anchor.start&&page.end>anchor.start):0;
      setLayout(next);setIndex(Math.max(0,found));setBusy(false);
    };
    const schedule=()=>{if(disposed)return;window.clearTimeout(timer);cancelAnimationFrame(frame);timer=window.setTimeout(()=>{frame=requestAnimationFrame(reflow)},120)};
    const fontsReady=()=>{
      const job=++fontJob;
      ready=false;
      void (async()=>{
        try { await document.fonts.load(getComputedStyle(content).font,book.chapters.map(chapter=>chapter.content).join('')); } catch { /* The same fallback font is measured and displayed. */ }
        await document.fonts.ready;
        if(!disposed&&job===fontJob){clearReaderCache(book);ready=true;schedule()}
      })();
    };
    const fontsLoading=()=>{ready=false};
    const observer=new ResizeObserver(schedule);
    if(surface.current)observer.observe(surface.current);
    observer.observe(space);
    if(probe.current)observer.observe(probe.current);
    const media=matchMedia('(max-width:760px)');
    const changeMode=()=>{setSingle(media.matches);schedule()};
    media.addEventListener('change',changeMode);
    document.fonts.addEventListener('loading',fontsLoading);
    document.fonts.addEventListener('loadingdone',fontsReady);
    document.fonts.addEventListener('loadingerror',fontsReady);
    fontsReady();
    return()=>{disposed=true;window.clearTimeout(timer);cancelAnimationFrame(frame);observer.disconnect();media.removeEventListener('change',changeMode);document.fonts.removeEventListener('loading',fontsLoading);document.fonts.removeEventListener('loadingdone',fontsReady);document.fonts.removeEventListener('loadingerror',fontsReady)};
  },[book]);

  const turn=useCallback((direction:number)=>setIndex(previous=>Math.max(0,Math.min(last,Math.floor(previous/step)*step+direction*step))),[last,step]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{
    if(e.key==='ArrowRight'){e.preventDefault();turn(1)}
    if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}
  };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[turn]);

  const header=<header><span>{book.demo?'示範作品':book.author}</span><span>THE NEXT</span></header>;
  return <div className="reader" ref={root} aria-busy={busy} data-body-lines={layout?.metrics.lines} data-layout-width={layout?.metrics.width.toFixed(2)} data-layout-height={layout?.metrics.height.toFixed(2)}>
    <div className="reader-top"><span>THE NEXT <i>／</i> {book.title}</span><button className="text-button" onClick={onClose}>闔上書本 ↗</button></div>
    <div className="open-book" ref={surface}>
      {pages.slice(current,current+step).map((page,offset)=><article className="reading-page" key={`${page.chapterId}-${page.start}`} data-chapter={page.chapterId} data-start={page.start} data-end={page.end} data-page={current+offset+1}>
        {header}<div className="page-prose"><div className="page-heading">{getPageHeading(book,page)&&<h2>{getPageHeading(book,page)}</h2>}</div><div className="page-body-slot"><div className="page-body"><div className="page-text"><span hidden>{pageTextParts(page).prefix}</span>{pageTextParts(page).text}<span hidden>{pageTextParts(page).suffix}</span></div></div></div></div><footer>— {current+offset+1} —</footer>
      </article>)}
      {(!pages.length||(!single&&current+1>=pages.length))&&<article className="reading-page blank-page" aria-label="空白末頁"/>}
    </div>
    <div className="pagination-measure" ref={measure} aria-hidden="true"><article className="reading-page">{header}<div className="page-prose"><div className="page-heading"/><div className="page-body-slot" ref={slot}><div className="page-body" ref={body}><div className="page-text" ref={text}/></div><span className="reader-line-probe" ref={probe}>漢字Ag，。Ｍ</span></div></div><footer>— 1 —</footer></article></div>
    <div className="reader-controls"><button disabled={current===0||!pages.length} onClick={()=>turn(-1)}>← 上一頁</button><span aria-live="polite">{pages.length?`${current+1}${!single&&current+1<pages.length?`–${current+2}`:''} / ${pages.length}`:'正在排版…'}</span><button disabled={current>=last||!pages.length} onClick={()=>turn(1)}>下一頁 →</button></div>
    <p className="reader-hint">{current>=last&&pages.length?'已抵達最後一頁。闔上書本，尋找下一個故事。':'讓文字慢下來，讓世界遠一點。'}</p>
  </div>;
}
