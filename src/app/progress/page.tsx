"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type Workout = {
  id: string;
  created_at: string;
  name: string;
  exercises: Exercise[];
};

type Exercise = {
  id: string;
  name: string;
  weight: number | null;
  reps: number | null;
};

type ViewState = "all" | { exerciseName: string };

export default function ProgressPage() {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [viewState, setViewState] = useState<ViewState>("all");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch workout data on mount
  useEffect(() => {
    async function fetchWorkouts() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const userId = session.user.id;

      const { data, error } = await supabase
        .from("workouts")
        .select("*, exercises(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workouts:", error);
      } else {
        setAllWorkouts(data || []);
      }
      setIsLoading(false);
    }
    fetchWorkouts();
  }, [router]);

  // Get unique exercises sorted alphabetically
  const uniqueExercises = Array.from(
    new Set(allWorkouts.flatMap((w) => w.exercises.map((e) => e.name)))
  ).sort();

  // Get exercise history sorted by most recent first
  const getExerciseHistory = (exerciseName: string) => {
    const history = allWorkouts
      .flatMap((w) =>
        w.exercises
          .filter((e) => e.name === exerciseName)
          .map((e) => ({
            ...e,
            created_at: w.created_at,
            workoutName: w.name,
          }))
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return history;
  };

  // Calculate net strength gain
  const calculateStrengthGain = (exerciseName: string) => {
    const history = getExerciseHistory(exerciseName);
    if (history.length < 2) return 0; // Need at least 2 entries for comparison

    const earliest = history[history.length - 1];
    const latest = history[0];
    const earliestPoundage = (earliest.weight || 0) * (earliest.reps || 0);
    const latestPoundage = (latest.weight || 0) * (latest.reps || 0);
    return latestPoundage - earliestPoundage;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        {isLoading ? (
          <div className="bg-white shadow-md rounded-lg p-4 text-center min-h-[100px] flex items-center justify-center">
            <div className="text-gray-700">Loading...</div>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Exercise Progress
            </h2>

            {viewState === "all" ? (
              <ul className="space-y-4">
                {uniqueExercises.map((exerciseName) => (
                  <li
                    key={exerciseName}
                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setViewState({ exerciseName })}
                  >
                    <div className="text-lg font-semibold text-gray-800">
                      {exerciseName}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => setViewState("all")}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors mr-4"
                  >
                    Back to Exercises
                  </button>
                  <span
                    className={`text-xl font-semibold ${
                      calculateStrengthGain(viewState.exerciseName) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Net Strength Gain:{" "}
                    {calculateStrengthGain(viewState.exerciseName)} lbs
                  </span>
                </div>
                <ul className="space-y-4">
                  {getExerciseHistory(viewState.exerciseName).map((entry) => (
                    <li
                      key={entry.id}
                      className="bg-white shadow-md rounded-lg p-4"
                    >
                      <div className="text-lg font-semibold text-gray-800">
                        {new Date(entry.created_at).toLocaleDateString()} -{" "}
                        {entry.workoutName}
                      </div>
                      <div className="text-gray-700 mt-2">
                        {entry.weight || "N/A"} lbs x {entry.reps || "N/A"} reps
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
