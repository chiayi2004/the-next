import type { Book } from '../types/book';
import { confession } from './books/confession/index.ts';
import { summerFestival } from './books/summer-festival/index.ts';
import { whaleBoy } from './books/whale-boy/index.ts';
import { lemonCandy } from './books/lemon-candy/index.ts';

// Only author-provided works belong in the published collection.
const collection: Book[] = [confession, summerFestival, whaleBoy, lemonCandy];
export const books = collection.filter(book=>!book.demo).sort((a,b)=>a.shelfOrder-b.shelfOrder);
