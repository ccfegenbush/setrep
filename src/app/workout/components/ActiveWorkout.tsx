"use client";

import Exercises from "@/components/Exercises";
import RestTimer from "@/components/RestTimer";
import { formatTime } from "../utils/formatTime";
import { FaStopwatch } from "react-icons/fa";
import { useWorkoutTime } from "../hooks/useWorkout"; // Import the hook

type Set = {
  id?: string;
  weight: number;
  reps: number;
  set_number: number;
};

type Exercise = {
  id?: string;
  name: string;
  workout_id: string;
  sets: Set[];
};

type ActiveWorkoutProps = {
  workoutId: string;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  planName: string;
  setPlanName: (name: string) => void;
  onEndWorkout: () => void;
  setToastMessage: (message: string | null) => void;
  setShowToast: (show: boolean) => void;
};

export default function ActiveWorkout({
  workoutId,
  exercises,
  setExercises,
  planName,
  setPlanName,
  onEndWorkout,
  setToastMessage,
  setShowToast,
}: ActiveWorkoutProps) {
  const elapsedTime = useWorkoutTime(); // Use the hook to get real-time elapsed time

  return (
    <div className="bg-whoop-card rounded-xl p-6 shadow-lg transition-all duration-300">
      <div className="flex items-center justify-center mb-6">
        <FaStopwatch className="text-whoop-green text-2xl sm:text-3xl mr-3 transition-transform hover:scale-105" />
        <div className="text-3xl sm:text-4xl font-mono text-whoop-white">
          {formatTime(elapsedTime)}
        </div>
      </div>
      <Exercises
        workoutId={workoutId}
        exercises={exercises}
        setExercises={setExercises}
        setToastMessage={setToastMessage}
        setShowToast={setShowToast}
      />
      <RestTimer />
      <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <input
          type="text"
          placeholder="Workout Name"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="flex-grow p-4 bg-whoop-dark/50 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 text-base shadow-sm"
        />
        <button
          onClick={onEndWorkout}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white font-semibold rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 hover:shadow-lg transition-all duration-200 text-base"
        >
          End
        </button>
      </div>
    </div>
  );
}
