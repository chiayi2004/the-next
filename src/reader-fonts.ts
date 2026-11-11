// Start once: loadingdone must not start another fonts.load / fonts.ready cycle.
// Slow or blocked web fonts must still allow reading with the rendered fallback.
export function watchReaderFonts(fonts: FontFaceSet, font: string, sample: string, onReady: () => void, timeoutMs = 1800) {
  let disposed = false;
  const activate = () => { if (!disposed) onReady(); };
  const timeout = setTimeout(activate, timeoutMs);
  const complete = () => { clearTimeout(timeout); activate(); };
  fonts.addEventListener('loadingdone', complete);
  fonts.addEventListener('loadingerror', complete);
  void (async () => {
    try { await fonts.load(font, sample); await fonts.ready; } catch { /* Measure the rendered fallback font. */ }
    complete();
  })();
  return () => {
    disposed = true;
    clearTimeout(timeout);
    fonts.removeEventListener('loadingdone', complete);
    fonts.removeEventListener('loadingerror', complete);
  };
}
