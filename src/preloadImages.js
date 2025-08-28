export default async function preloadImages(
  urls,
  {
    concurrency = 8,
    keepAlive = false,
    tolerateErrors = false, // don't fail entire preload on one bad image
    revokeBlobURLsOnRelease = false, // only safe if your code created those blob: URLs
    crossOrigin = null, // e.g., 'anonymous' if you plan to draw to canvas
    label = "",
  } = {}
) {
  const kept = keepAlive ? [] : null;
  if (label) console.log(`Loading: ${label} frames`);

  async function loadOne(src) {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    if (crossOrigin != null) img.crossOrigin = crossOrigin;

    // Attach fallback listeners before setting src
    const onSettle = new Promise((res) => {
      img.onload = img.onerror = () => res();
    });

    img.src = src;

    try {
      if (typeof img.decode === "function") {
        try {
          await img.decode();
        } catch (e) {
          // Some browsers reject decode() even when onload fires.
          await onSettle;
          if (!tolerateErrors) throw e;
        }
      } else {
        await onSettle;
      }
      console.log(`Loaded: ${src}`);
      if (kept) kept.push(img);
      return img;
    } catch (err) {
      if (!tolerateErrors) throw err;
      return null;
    } finally {
      img.onload = img.onerror = null;
    }
  }

  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const index = i++;
      await loadOne(urls[index]);
    }
  }

  const pool = [];
  for (let j = 0; j < Math.min(concurrency, urls.length); j++) {
    pool.push(worker());
  }
  await Promise.all(pool);

  return {
    images: kept || undefined, // expose if you want to reuse them
    release() {
      if (!kept) return;
      for (const img of kept) {
        try {
          img.onload = img.onerror = null;
        } catch {}
        try {
          const src = img.currentSrc || img.src || "";
          if (revokeBlobURLsOnRelease && src.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(src);
            } catch {}
          }
          // Clear the source so the decoded bitmap can be dropped
          img.src = "";
        } catch {}
      }
      kept.length = 0; // drop references so GC can collect
    },
  };
}