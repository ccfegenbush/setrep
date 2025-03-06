"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Adjust path to your Supabase client
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type Workout = {
  id: string;
  date: string;
  name: string;
  exercises: Exercise[];
};

type Exercise = {
  id: string;
  name: string;
  weight: number | null;
  reps: number | null;
};

export default function ProgressPage() {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [filterWorkoutName, setFilterWorkoutName] = useState("");
  const [filterExerciseName, setFilterExerciseName] = useState("");
  const [totalPoundage, setTotalPoundage] = useState(0);
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
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching workouts:", error);
      } else {
        setAllWorkouts(data || []);
        setFilteredWorkouts(data || []);
        calculateTotalPoundage(data || []);
      }
      setIsLoading(false);
    }
    fetchWorkouts();
  }, [router]);

  // Update filtered and sorted workouts when filters or sort order change
  useEffect(() => {
    let workouts = [...allWorkouts];

    // Apply workout name filter
    if (filterWorkoutName) {
      workouts = workouts.filter((workout) =>
        workout.name.toLowerCase().includes(filterWorkoutName.toLowerCase())
      );
    }

    // Apply exercise name filter
    if (filterExerciseName) {
      workouts = workouts.filter((workout) =>
        workout.exercises.some((exercise) =>
          exercise.name.toLowerCase().includes(filterExerciseName.toLowerCase())
        )
      );
    }

    // Sort by date
    workouts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredWorkouts(workouts);
  }, [allWorkouts, sortOrder, filterWorkoutName, filterExerciseName]);

  // Calculate total poundage for the current month
  function calculateTotalPoundage(workouts: Workout[]) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyWorkouts = workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return (
        workoutDate.getMonth() === currentMonth &&
        workoutDate.getFullYear() === currentYear
      );
    });

    const total = monthlyWorkouts.reduce((sum, workout) => {
      const workoutPoundage = workout.exercises.reduce((exSum, exercise) => {
        return exSum + (exercise.weight || 0) * (exercise.reps || 0);
      }, 0);
      return sum + workoutPoundage;
    }, 0);
    setTotalPoundage(total);
  }

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Workout Progress
        </h2>

        {/* Sorting Dropdown */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Sort by date:
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="ml-2 p-2 border border-gray-300 rounded-md"
            >
              <option value="desc">Most recent first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
        </div>

        {/* Filter by Workout Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Filter by workout name:
            <input
              type="text"
              value={filterWorkoutName}
              onChange={(e) => setFilterWorkoutName(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md w-64"
            />
          </label>
        </div>

        {/* Filter by Exercise Name */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Filter by exercise name:
            <input
              type="text"
              value={filterExerciseName}
              onChange={(e) => setFilterExerciseName(e.target.value)}
              className="ml-2 p-2 border border-gray-300 rounded-md w-64"
            />
          </label>
        </div>

        {/* Workout List */}
        <ul className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <li key={workout.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-800">
                {new Date(workout.date).toLocaleDateString()} - {workout.name}
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

        {/* Total Poundage */}
        <div className="mt-6 text-gray-700">
          <strong>Total Poundage This Month:</strong> {totalPoundage} lbs
        </div>
      </main>
    </div>
  );
}
