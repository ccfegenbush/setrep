"use client";

import { useState, useEffect } from "react";

export default function RestTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
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
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Rest Timer</h2>
      <div className="text-2xl font-mono text-gray-700 mb-4">{time}s</div>
      <div className="flex space-x-4">
        <button
          onClick={() => startTimer(60)}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
          disabled={isRunning}
        >
          Start (60s)
        </button>
        <button
          onClick={stopTimer}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold"
          disabled={!isRunning}
        >
          Stop
        </button>
        <button
          onClick={resetTimer}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 transition-colors font-semibold"
          disabled={time === 0}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
