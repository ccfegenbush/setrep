"use client";

import { useState, useEffect } from "react";
import { FaPlay, FaStop } from "react-icons/fa";

export default function RestTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      setTime(0);
    } else {
      setIsRunning(true);
    }
  };

  return (
    <div className="bg-whoop-card rounded-xl p-4 mt-3 shadow-lg">
      <h2 className="text-sm font-semibold text-whoop-white mb-2">Rest</h2>
      <div className="flex justify-center space-x-6">
        <div className="flex-1 flex justify-center">
          <div className="text-2xl font-mono text-whoop-green">{time}s</div>
        </div>
        <div className="flex-1 flex justify-center">
          <button
            onClick={toggleTimer}
            className={`px-4 py-2 text-whoop-dark font-medium rounded-lg transition-transform hover:scale-102 text-sm ${
              isRunning
                ? "bg-gradient-to-r from-red-600 to-red-800"
                : "bg-gradient-to-r from-whoop-green to-whoop-cyan"
            }`}
          >
            {isRunning ? (
              <FaStop className="w-4 h-4" />
            ) : (
              <FaPlay className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
