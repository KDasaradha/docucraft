import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

interface NavigationState {
  isNavigating: boolean;
  previousPath: string | null;
  currentPath: string;
}

export function useEnhancedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    previousPath: null,
    currentPath: pathname || '',
  });

  // Track navigation changes
  useEffect(() => {
    setNavigationState(prev => ({
      isNavigating: false,
      previousPath: prev.currentPath,
      currentPath: pathname || '',
    }));
  }, [pathname]);

  // Enhanced navigation with loading states
  const navigateWithLoading = useCallback((href: string) => {
    setNavigationState(prev => ({
      ...prev,
      isNavigating: true,
    }));
    
    router.push(href);
  }, [router]);

  // Prefetch pages for better performance
  const prefetchPage = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  return {
    ...navigationState,
    navigateWithLoading,
    prefetchPage,
  };
}