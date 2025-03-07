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

type ViewState =
  | { type: "all" }
  | { type: "workout"; workoutName: string }
  | { type: "exercise"; exerciseName: string };

export default function ProgressPage() {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ type: "all" });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPoundage, setTotalPoundage] = useState(0);
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
        calculateTotalPoundage(data || [], { type: "all" });
      }
      setIsLoading(false);
    }
    fetchWorkouts();
  }, [router]);

  // Calculate total poundage based on current view
  function calculateTotalPoundage(workouts: Workout[], state: ViewState) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let filteredWorkouts = workouts;

    if (state.type === "workout") {
      filteredWorkouts = workouts.filter((w) => w.name === state.workoutName);
    }

    const monthlyWorkouts = filteredWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.created_at);
      return (
        workoutDate.getMonth() === currentMonth &&
        workoutDate.getFullYear() === currentYear
      );
    });

    const total = monthlyWorkouts.reduce((sum, workout) => {
      let exercises = workout.exercises;
      if (state.type === "exercise") {
        exercises = workout.exercises.filter(
          (e) => e.name === state.exerciseName
        );
      }
      const workoutPoundage = exercises.reduce((exSum, exercise) => {
        return exSum + (exercise.weight || 0) * (exercise.reps || 0);
      }, 0);
      return sum + workoutPoundage;
    }, 0);
    setTotalPoundage(total);
  }

  // Handle view changes and update poundage
  useEffect(() => {
    calculateTotalPoundage(allWorkouts, viewState);
  }, [allWorkouts, viewState]);

  // Navigate back up the hierarchy
  const handleBack = () => {
    if (viewState.type === "exercise") {
      const workoutName =
        allWorkouts.find((w) =>
          w.exercises.some((e) => e.name === viewState.exerciseName)
        )?.name || "";
      setViewState({ type: "workout", workoutName });
    } else if (viewState.type === "workout") {
      setViewState({ type: "all" });
    }
  };

  // Get unique workout names for initial view
  const uniqueWorkouts = Array.from(new Set(allWorkouts.map((w) => w.name)))
    .map((name) => allWorkouts.find((w) => w.name === name)!)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // Get workout history for a specific workout
  const getWorkoutHistory = (workoutName: string) => {
    return allWorkouts
      .filter((w) => w.name === workoutName)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  };

  // Get exercise history across all workouts
  const getExerciseHistory = (exerciseName: string) => {
    return allWorkouts
      .filter((w) => w.exercises.some((e) => e.name === exerciseName))
      .map((w) => ({
        ...w,
        exercises: w.exercises.filter((e) => e.name === exerciseName),
      }))
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  };

  // Get current month name
  const currentMonthName = new Date().toLocaleString("default", {
    month: "long",
  });

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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                {viewState.type === "all"
                  ? "Workout Progress"
                  : viewState.type === "workout"
                  ? `Progress for ${viewState.workoutName}`
                  : `Progress for ${viewState.exerciseName}`}
              </h2>
              {viewState.type !== "all" && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
              )}
            </div>

            {viewState.type === "all" && (
              <ul className="space-y-4">
                {uniqueWorkouts.map((workout) => (
                  <li
                    key={workout.id}
                    className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setViewState({
                        type: "workout",
                        workoutName: workout.name,
                      })
                    }
                  >
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(workout.created_at).toLocaleDateString()} -{" "}
                      {workout.name}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {viewState.type === "workout" && (
              <>
                <ul className="space-y-4 mb-6">
                  {Array.from(
                    new Set(
                      getWorkoutHistory(viewState.workoutName)
                        .flatMap((w) => w.exercises)
                        .map((e) => e.name)
                    )
                  ).map((exerciseName) => (
                    <li
                      key={exerciseName}
                      className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setViewState({ type: "exercise", exerciseName })
                      }
                    >
                      <div className="text-lg font-semibold text-gray-800">
                        {exerciseName}
                      </div>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-4">
                  {getWorkoutHistory(viewState.workoutName).map((workout) => (
                    <li
                      key={workout.id}
                      className="bg-white shadow-md rounded-lg p-4"
                    >
                      <div className="text-lg font-semibold text-gray-800">
                        {new Date(workout.created_at).toLocaleDateString()}
                      </div>
                      <ul className="mt-2 space-y-2">
                        {workout.exercises.map((exercise) => (
                          <li key={exercise.id} className="text-gray-700">
                            {exercise.name}: {exercise.weight || "N/A"}lbs x{" "}
                            {exercise.reps || "N/A"} reps
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {viewState.type === "exercise" && (
              <ul className="space-y-4">
                {getExerciseHistory(viewState.exerciseName).map((workout) => (
                  <li
                    key={workout.id}
                    className="bg-white shadow-md rounded-lg p-4"
                  >
                    <div className="text-lg font-semibold text-gray-800">
                      {new Date(workout.created_at).toLocaleDateString()} -{" "}
                      {workout.name}
                    </div>
                    <ul className="mt-2 space-y-2">
                      {workout.exercises.map((exercise) => (
                        <li key={exercise.id} className="text-gray-700">
                          {exercise.weight || "N/A"}lbs x{" "}
                          {exercise.reps || "N/A"} reps
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 text-gray-700">
              <strong>Tonnage for {currentMonthName}:</strong> {totalPoundage}{" "}
              lbs
            </div>
          </>
        )}
      </main>
    </div>
  );
}
