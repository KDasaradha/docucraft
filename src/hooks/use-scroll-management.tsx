import { useEffect, useState, useCallback, useRef } from 'react';

interface ScrollState {
  scrollY: number;
  scrollProgress: number;
  isScrollingUp: boolean;
  isNearTop: boolean;
  isNearBottom: boolean;
}

interface UseScrollManagementOptions {
  threshold?: number;
  throttleMs?: number;
  rootMargin?: string;
}

export function useScrollManagement(options: UseScrollManagementOptions = {}) {
  const {
    threshold = 10,
    throttleMs = 16, // ~60fps
    rootMargin = '0px'
  } = options;

  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollProgress: 0,
    isScrollingUp: false,
    isNearTop: true,
    isNearBottom: false,
  });

  const lastScrollY = useRef(0);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);

  const updateScrollState = useCallback(() => {
    const scrollY = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = documentHeight > 0 ? (scrollY / documentHeight) * 100 : 0;
    
    const isScrollingUp = scrollY < lastScrollY.current;
    const isNearTop = scrollY < threshold;
    const isNearBottom = scrollY > documentHeight - threshold;

    setScrollState({
      scrollY,
      scrollProgress: Math.min(Math.max(scrollProgress, 0), 100),
      isScrollingUp,
      isNearTop,
      isNearBottom,
    });

    lastScrollY.current = scrollY;
  }, [threshold]);

  const throttledUpdateScrollState = useCallback(() => {
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current);
    }
    
    throttleTimer.current = setTimeout(updateScrollState, throttleMs);
  }, [updateScrollState, throttleMs]);

  // Smooth scroll to element
  const scrollToElement = useCallback((
    element: HTMLElement | string,
    options: ScrollIntoViewOptions = {}
  ) => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;
    
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options,
      });
    }
  }, []);

  // Scroll to top with smooth animation
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    // Initial scroll state
    updateScrollState();

    // Event listeners
    window.addEventListener('scroll', throttledUpdateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledUpdateScrollState);
      window.removeEventListener('resize', updateScrollState);
      
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [throttledUpdateScrollState, updateScrollState]);

  return {
    ...scrollState,
    scrollToElement,
    scrollToTop,
    scrollToBottom,
  };
}

// Hook for intersection observer functionality
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setIntersectionRatio(entry.intersectionRatio);
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return { isIntersecting, intersectionRatio };
}