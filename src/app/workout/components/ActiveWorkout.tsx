"use client";

import Exercises from "@/components/Exercises";
import RestTimer from "@/components/RestTimer";
import { Exercise } from "@/types";
import { formatTime } from "../utils/formatTime";

type ActiveWorkoutProps = {
  workoutId: string;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  planName: string;
  setPlanName: (name: string) => void;
  onEndWorkout: () => void;
  elapsedTime?: number; // Optional prop for elapsed time
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
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-center mb-6">
        <div className="text-5xl font-mono text-gray-700">
          {formatTime(elapsedTime)}
        </div>
      </div>
      <Exercises
        workoutId={workoutId}
        exercises={exercises}
        setExercises={setExercises}
      />
      <RestTimer />
      <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="Workout Name"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <button
          onClick={onEndWorkout}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
        >
          End Workout
        </button>
      </div>
    </div>
  );
}
