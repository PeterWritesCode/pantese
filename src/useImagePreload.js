import * as React from "react";
import preloadImages from "./preloadImages";
export function useImagePreload(urls, options) {
  const preloaderRef = React.useRef(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let canceled = false;
    (async () => {
      const preloader = await preloadImages(urls, options);
      if (canceled) {
        preloader.release();
        return;
      }
      preloaderRef.current = preloader;
      setReady(true);
    })();
    return () => {
      canceled = true;
      preloaderRef.current?.release();
      preloaderRef.current = null;
      setReady(false);
    };
    // Note: ensure `urls` and `options` are stable or memoized
  }, [urls, options]);
  return {
    ready,
    images: preloaderRef.current?.images,
    release: () => preloaderRef.current?.release(),
  };
}