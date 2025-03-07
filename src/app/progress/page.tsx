"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Toast from "@/app/workout/components/Toast";
import DeleteModal from "@/app/workout/components/DeleteModal";
import { FaChartBar, FaTrash } from "react-icons/fa";

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

type Workout = {
  id: string;
  created_at: string;
  name: string;
  exercises: Exercise[];
};

type ViewState = "all" | { exerciseName: string };

export default function ProgressPage() {
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [viewState, setViewState] = useState<ViewState>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState<
    "workout" | "exercise" | "plan"
  >("workout");
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>("");
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
        .select("*, exercises(*, sets(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching workouts:", error);
        setToastMessage("Failed to fetch workout progress.");
        setShowToast(true);
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
            workoutId: w.id,
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

    const earliestBestSet = earliest.sets.reduce(
      (best, set) => {
        const poundage = (set.weight || 0) * (set.reps || 0);
        return poundage > best.poundage ? { ...set, poundage } : best;
      },
      { poundage: 0, weight: 0, reps: 0 }
    );

    const latestBestSet = latest.sets.reduce(
      (best, set) => {
        const poundage = (set.weight || 0) * (set.reps || 0);
        return poundage > best.poundage ? { ...set, poundage } : best;
      },
      { poundage: 0, weight: 0, reps: 0 }
    );

    return latestBestSet.poundage - earliestBestSet.poundage;
  };

  const openDeleteModal = (
    itemType: "workout" | "exercise",
    id: string,
    name: string
  ) => {
    setDeleteItemType(itemType);
    setDeleteItemId(id);
    setDeleteItemName(name);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      if (deleteItemType === "workout") {
        const { error: workoutError } = await supabase
          .from("workouts")
          .delete()
          .eq("id", deleteItemId);
        if (workoutError) throw workoutError;

        setAllWorkouts(allWorkouts.filter((w) => w.id !== deleteItemId));
        setToastMessage("Workout deleted successfully!");
        setShowToast(true);
      } else if (deleteItemType === "exercise") {
        const { error: setsError } = await supabase
          .from("sets")
          .delete()
          .eq("exercise_id", deleteItemId);
        if (setsError) throw setsError;

        const { error: exerciseError } = await supabase
          .from("exercises")
          .delete()
          .eq("id", deleteItemId);
        if (exerciseError) throw exerciseError;

        setAllWorkouts(
          allWorkouts.map((w) => ({
            ...w,
            exercises: w.exercises.filter((e) => e.id !== deleteItemId),
          }))
        );
        setToastMessage("Exercise deleted successfully!");
        setShowToast(true);
      }
    } catch (error) {
      console.error(`Error deleting ${deleteItemType}:`, error);
      setToastMessage(`Failed to delete ${deleteItemType}. Please try again.`);
      setShowToast(true);
    } finally {
      setDeleteModalOpen(false);
      setDeleteItemId(null);
      setDeleteItemName("");
    }
  };

  return (
    <div className="min-h-screen bg-whoop-dark text-whoop-white font-sans">
      <Header />
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          deleteModalOpen ? "blur-sm" : ""
        }`}
      >
        {isLoading ? (
          <div className="bg-whoop-card rounded-xl p-6 sm:p-8 shadow-lg text-center min-h-[200px] flex items-center justify-center transition-all duration-300">
            <div className="text-whoop-gray/70 text-lg animate-pulse">
              Loading Progress...
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-10">
              <FaChartBar className="text-whoop-green text-3xl sm:text-4xl mr-4 transition-transform hover:scale-105" />
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-whoop-white to-whoop-cyan bg-clip-text text-transparent">
                Exercise Progress
              </h2>
            </div>

            {viewState === "all" ? (
              <ul className="space-y-4">
                {uniqueExercises.map((exerciseName) => (
                  <li
                    key={exerciseName}
                    className="bg-whoop-card rounded-xl p-5 cursor-pointer shadow-sm hover:bg-whoop-dark/50 transition-all duration-200"
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
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                  <button
                    onClick={() => setViewState("all")}
                    className="px-5 py-2.5 bg-gradient-to-r from-whoop-cyan to-whoop-green text-whoop-dark font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-cyan/80 hover:to-whoop-green/80 transition-all duration-200 shadow-sm"
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
                      className="bg-whoop-card rounded-xl p-5 shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-lg font-semibold text-whoop-white">
                          {new Date(entry.created_at).toLocaleDateString()} -{" "}
                          {entry.workoutName}
                        </div>
                        <button
                          onClick={() =>
                            openDeleteModal(
                              "workout",
                              entry.workoutId,
                              entry.workoutName
                            )
                          }
                          className="p-2 text-whoop-white hover:text-red-400 transition-colors duration-200"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="mt-2">
                          {entry.sets.length > 0 ? (
                            entry.sets.map((set) => (
                              <div
                                key={set.set_number}
                                className="text-whoop-gray/80 text-sm"
                              >
                                Set {set.set_number}: {set.weight} lbs x{" "}
                                {set.reps} reps
                              </div>
                            ))
                          ) : (
                            <div className="text-whoop-gray/80 text-sm">
                              No sets recorded
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            entry.id &&
                            entry.name &&
                            openDeleteModal("exercise", entry.id, entry.name)
                          }
                          className="p-2 text-whoop-white hover:text-red-400 transition-colors duration-200"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </main>
      <DeleteModal
        isOpen={deleteModalOpen}
        itemType={deleteItemType}
        itemName={deleteItemName}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteItemId(null);
          setDeleteItemName("");
        }}
        onConfirm={confirmDelete}
      />
      <Toast
        message={toastMessage || ""}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage(null);
        }}
      />
    </div>
  );
}
