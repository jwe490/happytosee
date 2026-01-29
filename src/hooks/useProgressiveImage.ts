import { useState, useEffect, useRef } from "react";

interface UseProgressiveImageOptions {
  src: string;
  placeholder?: string;
  rootMargin?: string;
}

export function useProgressiveImage({
  src,
  placeholder = "/placeholder.svg",
  rootMargin = "200px",
}: UseProgressiveImageOptions) {
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setCurrentSrc(placeholder);
      setIsLoaded(true);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isInView, src, placeholder]);

  return {
    ref: imgRef,
    src: currentSrc,
    isLoaded,
    isInView,
  };
}

// Image cache with WeakMap for automatic garbage collection
const imageCache = new Map<string, HTMLImageElement>();
const MAX_CACHE_SIZE = 50;

export function preloadImage(src: string): Promise<void> {
  if (imageCache.has(src)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Maintain cache size limit
      if (imageCache.size >= MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }
      imageCache.set(src, img);
      resolve();
    };
    
    img.onerror = reject;
    img.src = src;
  });
}

export function clearImageCache() {
  imageCache.clear();
}
