"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only if the loading state persists longer than the specified delay (in ms).
 * This prevents skeletons from flashing on fast network connections.
 */
export function useLoadingDelay(loading: boolean, delay: number = 200): boolean {
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSkeleton(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [loading, delay]);

  return showSkeleton;
}
