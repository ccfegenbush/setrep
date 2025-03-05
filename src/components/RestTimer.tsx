"use client";

import { useState, useEffect } from "react";

export default function RestTimer() {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer); // Cleanup on unmount or stop
  }, [isRunning, time]);

  const startTimer = (seconds: number) => {
    setTime(seconds);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="rest-timer">
      <h2>Rest Timer: {time}s</h2>
      <button onClick={() => startTimer(60)} disabled={isRunning}>
        Start (60s)
      </button>
      <button onClick={stopTimer} disabled={!isRunning}>
        Stop
      </button>
      <button onClick={resetTimer} disabled={time === 0}>
        Reset
      </button>
    </div>
  );
}
