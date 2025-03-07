"use client";

import { useState, useEffect } from "react";
import { FaPlay, FaStop } from "react-icons/fa"; // Added icons

export default function RestTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
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
    <div className="bg-whoop-card rounded-2xl p-6 mt-6 shadow-lg shadow-glow border border-whoop-cyan/20">
      <h2 className="text-xl font-semibold text-whoop-white mb-4">Rest</h2>
      <div className="flex justify-center space-x-8">
        <div className="flex-1 flex justify-center">
          <div className="text-5xl font-mono font-bold text-whoop-green tracking-wider">
            {time}s
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <button
            onClick={toggleTimer}
            className={`px-6 py-4 text-whoop-dark font-bold rounded-xl transition-transform duration-200 hover:scale-105 hover:shadow-glow ${
              isRunning
                ? "bg-gradient-to-r from-red-600 to-red-800"
                : "bg-gradient-to-r from-whoop-green to-whoop-cyan"
            }`}
          >
            {isRunning ? (
              <FaStop className="w-6 h-6" />
            ) : (
              <FaPlay className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
