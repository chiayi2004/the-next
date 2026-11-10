import type { Book } from './types/book';
import { pageTextParts, paginateToFit } from './pagination';
import type { Page } from './pagination';

export interface ReaderMetrics { width: number; height: number; lineHeight: number; lines: number }
const cache = new WeakMap<Book, Map<string, Page[]>>();
export function clearReaderCache(book: Book) { cache.delete(book); }

// This is the same natural-height text element rendered inside the visible paper.
export function measureReader(book: Book, slot: HTMLElement, body: HTMLElement, text: HTMLElement) {
  const style=getComputedStyle(text);
  const lineHeight=parseFloat(style.lineHeight);
  const available=slot.getBoundingClientRect();
  const lines=Math.floor((available.height+.001)/lineHeight);
  if(available.width<=0||lines<1)return null;
  const metrics:ReaderMetrics={width:available.width,height:lines*lineHeight,lineHeight,lines};
  body.style.height=`${metrics.height}px`;
  const key=JSON.stringify([metrics,style.fontFamily,style.fontSize,style.fontWeight,style.fontStyle,style.letterSpacing,style.wordSpacing,style.whiteSpace,style.overflowWrap,style.fontFeatureSettings,style.fontVariationSettings,style.textIndent,style.tabSize]);
  let entries=cache.get(book);
  if(!entries){entries=new Map();cache.set(book,entries)}
  let pages=entries.get(key);
  if(!pages){
    pages=paginateToFit(book,page=>{
      const parts=pageTextParts(page);
      const prefix=document.createElement('span');prefix.hidden=true;prefix.textContent=parts.prefix;
      const suffix=document.createElement('span');suffix.hidden=true;suffix.textContent=parts.suffix;
      text.replaceChildren(prefix,document.createTextNode(parts.text),suffix);
      const bounds=text.getBoundingClientRect();
      return bounds.height<=metrics.height+.01 && text.scrollWidth<=body.clientWidth;
    });
    entries.set(key,pages);
    if(entries.size>6)entries.delete(entries.keys().next().value!);
  }
  return {pages,metrics};
}
