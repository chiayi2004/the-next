import type { CSSProperties } from 'react';
import type { Book as BookType } from '../types/book';
import { tags } from '../data/tags';
import { Ornament } from './Ornament';
export function Book({book,index,onSelect}:{book:BookType;index:number;onSelect:()=>void}) {
  return <button className={`spine spine-${index}`} style={{'--book-color':tags[book.primaryTag].color} as CSSProperties} onClick={onSelect} aria-label={`取下《${book.title}》`}>
    <span className="spine-band"/><span className="spine-number">0{index+1}</span><span className={book.title.length>7?"spine-title long-spine-title":"spine-title"}>{book.title}</span><Ornament tag={book.primaryTag} className="spine-emblem"/><span className="spine-publisher">THE NEXT</span><span className="spine-band lower"/>
  </button>;
}
