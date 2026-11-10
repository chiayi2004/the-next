import { useEffect, useRef } from 'react';
import { books } from '../data/books';
import type { Book as BookType } from '../types/book';
import { Book } from './Book';
export function Bookshelf({onSelect}:{onSelect:(book:BookType)=>void}) {
  const shelf=useRef<HTMLDivElement>(null); const velocity=useRef(0);
  useEffect(()=>{let frame=0; let previous=0; const tick=(time:number)=>{if(shelf.current&&previous)shelf.current.scrollLeft+=velocity.current*Math.min(time-previous,32)/16;previous=time;frame=requestAnimationFrame(tick)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[]);
  const move=(direction:number)=>shelf.current?.scrollBy({left:direction*320,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return <section className="library" aria-label="小說書架">
    <div className="library-header"><span>私人藏書室 <i>／</i> 第一輯</span><span>藏書 {String(books.length).padStart(2,'0')} 冊</span></div>
    <div className="shelf-window" ref={shelf} onPointerMove={e=>{if(e.pointerType!=='mouse')return;const rect=e.currentTarget.getBoundingClientRect();const x=e.clientX-rect.left;velocity.current=x<90?-3:x>rect.width-90?3:0}} onPointerLeave={()=>velocity.current=0}>
      <div className={`wood-room ${books.length?'':'empty-room'}`}><div className="arch arch-one"/><div className="arch arch-two"/><div className="arch arch-three"/><div className="book-row">{books.length?<><div className="bookend" aria-hidden="true">✧</div>{books.map((book,index)=><Book key={book.id} book={book} index={index} onSelect={()=>onSelect(book)}/>)}<div className="lying-books" aria-hidden="true"><span>STORIES UNTOLD</span><span>THE NEXT CHAPTER</span><span>VOL. Ⅰ</span></div></>:<div className="empty-library" role="status"><span aria-hidden="true">✧</span><h2>書架已備妥</h2><p>等待第一部正式作品，<br/>讓新的世界從這裡開始。</p></div>}</div><div className="shelf-plank"/></div>
    </div>
    <div className={`shelf-controls ${books.length?'':'empty-controls'}`}>{books.length?<><button aria-label="往左探索書架" onClick={()=>move(-1)}>←</button><span>移動視線，或輕觸一本書 <span className="tiny-star">✦</span> 讓故事開始</span><button aria-label="往右探索書架" onClick={()=>move(1)}>→</button></>:<span>下一個世界，將由你的故事展開。</span>}</div>
  </section>;
}
