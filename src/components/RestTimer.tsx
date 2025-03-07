"use client";

import { useState, useEffect } from "react";

export default function RestTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1); // Increment time every second
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false); // Stop the timer
      setTime(0); // Reset to zero
    } else {
      setIsRunning(true); // Start counting up from current time (0 if reset)
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Rest</h2>
      <div className="flex justify-center space-x-8">
        <div className="flex-1 flex justify-center">
          <div className="text-5xl font-mono text-gray-700">{time}s</div>
        </div>
        <div className="flex-1 flex justify-center">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 text-white rounded-md hover:${
              isRunning ? "bg-red-700" : "bg-green-700"
            } transition-colors font-semibold text-lg ${
              isRunning ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {isRunning ? "End" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
