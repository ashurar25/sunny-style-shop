import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallback?: string;
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  priority = false,
  fallback = '/placeholder.svg',
  width,
  height,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(priority);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before coming into view
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Try WebP format first, fallback to original
  useEffect(() => {
    if (!isInView) return;

    const checkWebP = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };

    if (checkWebP() && src.includes('.')) {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Test if WebP version exists
      const img = new Image();
      img.onload = () => setCurrentSrc(webpSrc);
      img.onerror = () => setCurrentSrc(src); // Fallback to original
      img.src = webpSrc;
    } else {
      setCurrentSrc(src);
    }
  }, [src, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    if (!hasError && currentSrc !== fallback) {
      setHasError(true);
      setCurrentSrc(fallback);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60 animate-pulse" />
      )}
      
      <img
        ref={imgRef}
        src={isInView ? currentSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-all duration-700',
          isLoaded ? 'opacity-100' : 'opacity-0',
          'group-hover:scale-110'
        )}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
