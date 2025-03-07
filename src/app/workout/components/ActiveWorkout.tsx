"use client";

import Exercises from "@/components/Exercises";
import RestTimer from "@/components/RestTimer";
import { Exercise } from "@/types";
import { formatTime } from "../utils/formatTime";
import { FaStopwatch } from "react-icons/fa";

type ActiveWorkoutProps = {
  workoutId: string;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  planName: string;
  setPlanName: (name: string) => void;
  onEndWorkout: () => void;
  elapsedTime?: number;
};

export default function ActiveWorkout({
  workoutId,
  exercises,
  setExercises,
  planName,
  setPlanName,
  onEndWorkout,
  elapsedTime = 0,
}: ActiveWorkoutProps) {
  return (
    <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
      <div className="flex justify-center items-center mb-8">
        <FaStopwatch className="text-whoop-green text-3xl mr-3" />
        <div className="text-5xl font-mono font-bold text-whoop-white tracking-wider">
          {formatTime(elapsedTime)}
        </div>
      </div>
      <Exercises
        workoutId={workoutId}
        exercises={exercises}
        setExercises={setExercises}
      />
      <RestTimer />
      <div className="mt-8 flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="Workout Name"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="flex-grow p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray"
        />
        <button
          onClick={onEndWorkout}
          className="px-6 py-4 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
        >
          End Workout
        </button>
      </div>
    </div>
  );
}
