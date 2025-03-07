"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { FaChartBar } from "react-icons/fa"; // Added for progress icon

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

  const uniqueExercises = Array.from(
    new Set(allWorkouts.flatMap((w) => w.exercises.map((e) => e.name)))
  ).sort();

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

  const calculateStrengthGain = (exerciseName: string) => {
    const history = getExerciseHistory(exerciseName);
    if (history.length < 2) return 0;

    const earliest = history[history.length - 1];
    const latest = history[0];
    const earliestPoundage = (earliest.weight || 0) * (earliest.reps || 0);
    const latestPoundage = (latest.weight || 0) * (latest.reps || 0);
    return latestPoundage - earliestPoundage;
  };

  return (
    <div className="min-h-screen bg-whoop-dark text-whoop-white">
      <Header />
      <main className="max-w-6xl mx-auto p-6 md:p-10">
        {isLoading ? (
          <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20 text-center min-h-[100px] flex items-center justify-center">
            <div className="text-whoop-gray">Loading...</div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-8">
              <FaChartBar className="text-whoop-green text-4xl mr-3" />
              <h2 className="text-4xl font-bold tracking-tight">
                Exercise Progress
              </h2>
            </div>

            {viewState === "all" ? (
              <ul className="space-y-4">
                {uniqueExercises.map((exerciseName) => (
                  <li
                    key={exerciseName}
                    className="bg-whoop-card rounded-xl p-4 cursor-pointer hover:bg-whoop-dark hover:shadow-glow transition-all duration-200 border border-whoop-cyan/30"
                    onClick={() => setViewState({ exerciseName })}
                  >
                    <div className="text-lg font-semibold text-whoop-white">
                      {exerciseName}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                  <button
                    onClick={() => setViewState("all")}
                    className="px-4 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
                  >
                    Back to Exercises
                  </button>
                  <span
                    className={`text-xl font-semibold ${
                      calculateStrengthGain(viewState.exerciseName) >= 0
                        ? "text-whoop-green"
                        : "text-red-400"
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
                      className="bg-whoop-card rounded-xl p-4 border border-whoop-cyan/20 shadow-md"
                    >
                      <div className="text-lg font-semibold text-whoop-white">
                        {new Date(entry.created_at).toLocaleDateString()} -{" "}
                        {entry.workoutName}
                      </div>
                      <div className="text-whoop-gray mt-2">
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
