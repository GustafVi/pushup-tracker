import { useState, useRef, useCallback, useEffect } from 'react';

export function useSessionTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    setElapsed(Math.floor((now - startTimeRef.current + accumulatedRef.current) / 1000));
  }, []);

  const start = useCallback(() => {
    accumulatedRef.current = 0;
    startTimeRef.current = Date.now();
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    clearTick();
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, clearTick]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;
    accumulatedRef.current += Date.now() - startTimeRef.current;
    clearTick();
    setIsPaused(true);
  }, [isRunning, isPaused, clearTick]);

  const resume = useCallback(() => {
    if (!isPaused) return;
    startTimeRef.current = Date.now();
    setIsPaused(false);
    intervalRef.current = setInterval(tick, 1000);
  }, [isPaused, tick]);

  const stop = useCallback((): number => {
    clearTick();
    const final = isPaused
      ? Math.floor(accumulatedRef.current / 1000)
      : Math.floor((Date.now() - startTimeRef.current + accumulatedRef.current) / 1000);
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    return final;
  }, [isPaused, clearTick]);

  const reset = useCallback(() => {
    clearTick();
    setIsRunning(false);
    setIsPaused(false);
    setElapsed(0);
    accumulatedRef.current = 0;
  }, [clearTick]);

  // Cleanup on unmount
  useEffect(() => clearTick, [clearTick]);

  return { elapsed, isRunning, isPaused, start, pause, resume, stop, reset };
}
