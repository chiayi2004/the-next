import type { Book } from './types/book';
export interface Page { chapter: string; chapterId: string; content: string; start: number; end: number }

// Paragraph spacing at a physical page edge is not an extra blank opening line.
// Keep those characters in the DOM/source, with zero visual height on continuations.
export function pageTextParts(page: Page) {
  const prefix=page.start>0?(page.content.match(/^(?:\r?\n){1,2}/u)?.[0]??''):'';
  const rest=page.content.slice(prefix.length);
  const suffix=rest.match(/(?:\r?\n)+$/u)?.[0]??'';
  return {prefix,text:rest.slice(0,rest.length-suffix.length),suffix};
}

export function getPageHeading(book: Book, page: Page): string {
  if(page.start!==0)return '';
  return (book.hasChapters??book.chapters.length>1)?page.chapter:book.title;
}
// Measure the actual rendered page. Never trim or discard the author's text.
export function paginateToFit(book: Book, fits: (page: Page) => boolean): Page[] {
  return [...book.chapters].sort((a,b)=>a.order-b.order).flatMap(chapter=>{
    const boundaries=[...Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(chapter.content),segment=>segment.index),chapter.content.length];
    const pages: Page[]=[];
    for(let start=0;start<boundaries.length-1;){
      const candidate=(end:number):Page=>({chapter:chapter.title,chapterId:chapter.id,content:chapter.content.slice(boundaries[start],boundaries[end]),start:boundaries[start],end:boundaries[end]});
      // Bound the search near this page, rather than laying out half the remaining
      // novel on every page. This avoids huge synchronous layouts on phones.
      const remaining=boundaries.length-1-start;
      let span=Math.min(32,remaining),end=start;
      while(fits(candidate(start+span))){
        end=start+span;
        if(span===remaining)break;
        span=Math.min(span*2,remaining);
      }
      let low=end+1, high=end===boundaries.length-1?end:start+span-1;
      while(low<=high){const middle=Math.floor((low+high)/2);if(fits(candidate(middle))){end=middle;low=middle+1}else high=middle-1;}
      if(end===start)throw new Error('紙面空間不足，無法容納一個字元。');
      pages.push(candidate(end));start=end;
    }
    return pages;
  });
}
