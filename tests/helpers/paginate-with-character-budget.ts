import type { Book } from '../../src/types/book';
import { paginateToFit } from '../../src/pagination.ts';

// A cheap synthetic capacity for data-preservation unit tests, never used by the reader.
export function paginate(book: Book, limit=260) {
  return paginateToFit(book,page=>Array.from(page.content).length<=limit);
}
