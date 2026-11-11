import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchReaderFonts } from '../src/reader-fonts.ts';

class TestFonts extends EventTarget {
  calls = 0;
  ready: Promise<unknown> = new Promise(() => {});
  load() { this.calls++; return new Promise<FontFace[]>(() => {}); }
}
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test('字體請求與 ready 一直未完成時，仍以現有字體開始排版', async () => {
  const fonts = new TestFonts(); let layouts = 0;
  const stop = watchReaderFonts(fonts as unknown as FontFaceSet, '16px serif', '正文', () => layouts++, 10);
  await delay(30);
  assert.equal(layouts, 1);
  assert.equal(fonts.calls, 1);
  fonts.dispatchEvent(new Event('loadingdone'));
  assert.equal(layouts, 2);
  assert.equal(fonts.calls, 1, '字體完成事件不得再發起載入循環');
  stop();
});

test('字體完成後重新測量；關閉閱讀器後不再更新', async () => {
  const fonts = new TestFonts(); let layouts = 0;
  const stop = watchReaderFonts(fonts as unknown as FontFaceSet, '16px serif', '正文', () => layouts++, 10);
  fonts.dispatchEvent(new Event('loadingdone'));
  assert.equal(layouts, 1);
  stop();
  fonts.dispatchEvent(new Event('loadingdone'));
  fonts.dispatchEvent(new Event('loadingerror'));
  await delay(30);
  assert.equal(layouts, 1);
});

test('字體載入失敗也會排版，無須等待逾時', async () => {
  const fonts = new TestFonts(); let layouts = 0;
  fonts.load = () => Promise.reject(new Error('字體無法連線'));
  const stop = watchReaderFonts(fonts as unknown as FontFaceSet, '16px serif', '正文', () => layouts++, 1000);
  await delay(0);
  assert.equal(layouts, 1);
  stop();
});
