"use client";
import { useState, useEffect, useCallback } from "react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [justCameOnline, setJustCameOnline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setJustCameOnline(true);
    // Reset the "just came online" flag after 5 seconds
    setTimeout(() => setJustCameOnline(false), 5000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setJustCameOnline(false);
  }, []);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, justCameOnline };
}
