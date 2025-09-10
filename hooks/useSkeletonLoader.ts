import { useState, useEffect } from 'react';

export interface SkeletonLoaderOptions {
  initialLoading?: boolean;
  minLoadingTime?: number; // Minimum time to show skeleton (prevents flashing)
  maxLoadingTime?: number; // Maximum time before showing error state
}

export function useSkeletonLoader(options: SkeletonLoaderOptions = {}) {
  const {
    initialLoading = true,
    minLoadingTime = 500,
    maxLoadingTime = 10000,
  } = options;

  const [isLoading, setIsLoading] = useState(initialLoading);
  const [hasError, setHasError] = useState(false);
  const [loadingStartTime] = useState(Date.now());

  const startLoading = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const stopLoading = async () => {
    const elapsedTime = Date.now() - loadingStartTime;
    
    // Ensure minimum loading time to prevent flashing
    if (elapsedTime < minLoadingTime) {
      await new Promise(resolve => 
        setTimeout(resolve, minLoadingTime - elapsedTime)
      );
    }
    
    setIsLoading(false);
  };

  const setError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Auto-timeout for loading state
  useEffect(() => {
    if (isLoading && maxLoadingTime > 0) {
      const timeout = setTimeout(() => {
        setError();
      }, maxLoadingTime);

      return () => clearTimeout(timeout);
    }
  }, [isLoading, maxLoadingTime]);

  return {
    isLoading,
    hasError,
    startLoading,
    stopLoading,
    setError,
  };
}

// Hook for simulating API loading states
export function useSimulatedLoading(duration: number = 2000) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const reload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  };

  return { isLoading, reload };
}