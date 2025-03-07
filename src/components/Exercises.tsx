"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

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

type Props = {
  workoutId: string;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  setToastMessage: (message: string | null) => void;
  setShowToast: (show: boolean) => void;
};

export default function Exercises({
  workoutId,
  exercises,
  setExercises,
  setToastMessage,
  setShowToast,
}: Props) {
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    workout_id: workoutId,
    sets: [],
  });
  const [newSet, setNewSet] = useState<Set>({
    weight: 0,
    reps: 0,
    set_number: 1,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null
  );
  const [editedExercise, setEditedExercise] = useState<Exercise | null>(null);

  // Fetch historical data for an exercise
  const fetchHistoricalData = async (exerciseName: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: workouts } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", session.user.id);

    if (!workouts) return null;

    const workoutIds = workouts.map((w) => w.id);
    const { data: pastExercises, error } = await supabase
      .from("exercises")
      .select("id, name, sets(*)")
      .in("workout_id", workoutIds)
      .eq("name", exerciseName.trim())
      .order("id", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching historical data:", error);
      setToastMessage("Failed to fetch historical data.");
      setShowToast(true);
      return null;
    }

    if (pastExercises && pastExercises.length > 0) {
      const latestExercise = pastExercises[0];
      const latestSet = latestExercise.sets.sort(
        (a: Set, b: Set) => b.set_number - a.set_number
      )[0];
      return latestSet
        ? { weight: latestSet.weight, reps: latestSet.reps }
        : null;
    }
    return null;
  };

  const handleAddSet = async () => {
    if (newSet.weight <= 0 || newSet.reps <= 0) {
      setToastMessage("Please enter valid weight and reps for the set.");
      setShowToast(true);
      return;
    }

    // Check historical data if this is the first set
    if (newExercise.sets.length === 0 && newExercise.name) {
      const historicalData = await fetchHistoricalData(newExercise.name);
      if (historicalData) {
        setNewSet({
          ...newSet,
          weight: historicalData.weight,
          reps: historicalData.reps,
        });
      }
    }

    setNewExercise({
      ...newExercise,
      sets: [
        ...newExercise.sets,
        { ...newSet, set_number: newExercise.sets.length + 1 },
      ],
    });
    setNewSet({ weight: 0, reps: 0, set_number: newExercise.sets.length + 2 });
  };

  const saveExercise = async () => {
    const trimmedName = newExercise.name.trim();
    if (!trimmedName || newExercise.sets.length === 0) {
      setToastMessage("Please enter an exercise name and at least one set.");
      setShowToast(true);
      return;
    }
    setIsSaving(true);
    try {
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert({ name: trimmedName, workout_id: workoutId })
        .select()
        .single();
      if (exerciseError) throw exerciseError;

      const setsToInsert = newExercise.sets.map((set) => ({
        exercise_id: exerciseData.id,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
      }));

      const { error: setsError } = await supabase
        .from("sets")
        .insert(setsToInsert);
      if (setsError) throw setsError;

      setExercises([...exercises, { ...exerciseData, sets: newExercise.sets }]);
      setNewExercise({ name: "", workout_id: workoutId, sets: [] });
      setNewSet({ weight: 0, reps: 0, set_number: 1 });
    } catch (error) {
      console.error("Error saving exercise:", error);
      setToastMessage("Failed to save exercise. Please try again.");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (exercise: Exercise) => {
    setEditingExerciseId(exercise.id ?? null);
    setEditedExercise({ ...exercise });
  };

  const saveEditedExercise = async () => {
    if (!editedExercise || !editingExerciseId) return;
    setIsSaving(true);
    try {
      const { error: exerciseError } = await supabase
        .from("exercises")
        .update({ name: editedExercise.name })
        .eq("id", editingExerciseId);
      if (exerciseError) throw exerciseError;

      await supabase.from("sets").delete().eq("exercise_id", editingExerciseId);

      const setsToInsert = editedExercise.sets.map((set) => ({
        exercise_id: editingExerciseId,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
      }));

      const { error: setsError } = await supabase
        .from("sets")
        .insert(setsToInsert);
      if (setsError) throw setsError;

      setExercises(
        exercises.map((ex) =>
          ex.id === editingExerciseId ? { ...editedExercise } : ex
        )
      );
      setEditingExerciseId(null);
      setEditedExercise(null);
    } catch (error) {
      console.error("Error saving edited exercise:", error);
      setToastMessage("Failed to save changes. Please try again.");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditingExerciseId(null);
    setEditedExercise(null);
  };

  return (
    <div className="bg-whoop-card rounded-xl p-6 shadow-lg transition-all duration-300">
      <h2 className="text-xl font-bold text-whoop-white mb-4">Exercises</h2>
      <ul className="space-y-4 mb-6">
        {exercises.length === 0 ? (
          <li className="text-whoop-gray/80 text-sm">
            No exercises added yet.
          </li>
        ) : (
          exercises.map((exercise, index) => (
            <li
              key={exercise.id || index}
              className="bg-whoop-dark/50 rounded-xl p-4 shadow-sm"
            >
              {editingExerciseId === exercise.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedExercise?.name || ""}
                    onChange={(e) =>
                      setEditedExercise({
                        ...editedExercise!,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-whoop-dark/70 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 shadow-sm"
                  />
                  {editedExercise?.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex space-x-3 items-center">
                      <span className="text-whoop-gray/80 text-sm">
                        Set {set.set_number}:
                      </span>
                      <input
                        type="number"
                        placeholder="Weight (lb)"
                        value={set.weight || ""}
                        onChange={(e) =>
                          setEditedExercise({
                            ...editedExercise!,
                            sets: editedExercise!.sets.map((s, i) =>
                              i === setIndex
                                ? { ...s, weight: Number(e.target.value) }
                                : s
                            ),
                          })
                        }
                        className="w-24 p-3 bg-whoop-dark/70 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 shadow-sm"
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={set.reps || ""}
                        onChange={(e) =>
                          setEditedExercise({
                            ...editedExercise!,
                            sets: editedExercise!.sets.map((s, i) =>
                              i === setIndex
                                ? { ...s, reps: Number(e.target.value) }
                                : s
                            ),
                          })
                        }
                        className="w-24 p-3 bg-whoop-dark/70 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 shadow-sm"
                      />
                    </div>
                  ))}
                  <div className="flex space-x-3">
                    <button
                      onClick={saveEditedExercise}
                      className="p-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark rounded-xl hover:bg-gradient-to-r hover:from-whoop-green/80 hover:to-whoop-cyan/80 transition-all duration-200 shadow-sm"
                      disabled={isSaving}
                    >
                      <FaSave className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div className="text-whoop-white">
                    <div className="font-semibold">{exercise.name}</div>
                    {exercise.sets.map((set) => (
                      <div
                        key={set.set_number}
                        className="text-sm text-whoop-gray/80"
                      >
                        Set {set.set_number}: {set.weight} lbs x {set.reps} reps
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => startEditing(exercise)}
                    className="p-2 text-whoop-white hover:text-whoop-green transition-colors duration-200"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Exercise Name"
            value={newExercise.name}
            onChange={async (e) => {
              const name = e.target.value;
              setNewExercise({ ...newExercise, name });
              if (name && newExercise.sets.length === 0) {
                const historicalData = await fetchHistoricalData(name);
                if (historicalData) {
                  setNewSet({
                    ...newSet,
                    weight: historicalData.weight,
                    reps: historicalData.reps,
                  });
                }
              }
            }}
            className="w-full p-4 bg-whoop-dark/50 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 disabled:bg-whoop-gray/50 shadow-sm text-base"
            disabled={isSaving}
          />
          <input
            type="number"
            placeholder="Weight (lb)"
            value={newSet.weight || ""}
            onChange={(e) =>
              setNewSet({ ...newSet, weight: Number(e.target.value) })
            }
            className="w-full p-4 bg-whoop-dark/50 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 disabled:bg-whoop-gray/50 shadow-sm text-base"
            disabled={isSaving}
          />
          <input
            type="number"
            placeholder="Reps"
            value={newSet.reps || ""}
            onChange={(e) =>
              setNewSet({ ...newSet, reps: Number(e.target.value) })
            }
            className="w-full p-4 bg-whoop-dark/50 text-whoop-white border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green/50 placeholder-whoop-gray/70 transition-all duration-200 disabled:bg-whoop-gray/50 shadow-sm text-base"
            disabled={isSaving}
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddSet}
            className="w-full px-4 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-green text-whoop-dark font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-cyan/80 hover:to-whoop-green/80 transition-all duration-200 disabled:bg-whoop-gray/50 disabled:cursor-not-allowed shadow-sm"
            disabled={isSaving}
          >
            Add Set
          </button>
          <button
            onClick={saveExercise}
            className="w-full px-4 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-green/80 hover:to-whoop-cyan/80 transition-all duration-200 disabled:bg-whoop-gray/50 disabled:cursor-not-allowed shadow-sm"
            disabled={isSaving || newExercise.sets.length === 0}
          >
            Save Exercise
          </button>
        </div>
        {newExercise.sets.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-whoop-gray/80 mb-2">
              Sets for {newExercise.name}
            </h3>
            <ul className="space-y-2">
              {newExercise.sets.map((set) => (
                <li
                  key={set.set_number}
                  className="text-sm text-whoop-white bg-whoop-dark/70 p-2 rounded-xl shadow-sm"
                >
                  Set {set.set_number}: {set.weight} lbs x {set.reps} reps
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
