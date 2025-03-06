"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";

type Exercise = {
  id?: string;
  name: string;
  weight: number;
  reps: number;
  workout_id: string;
};

type Props = {
  workoutId: string;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
};

export default function ExerciseLog({
  workoutId,
  exercises,
  setExercises,
}: Props) {
  const [newExercise, setNewExercise] = useState<Exercise>({
    name: "",
    weight: 0,
    reps: 0,
    workout_id: workoutId,
  });
  const [isSaving, setIsSaving] = useState(false);

  async function saveExercise() {
    const trimmedName = newExercise.name.trim();
    if (!trimmedName || newExercise.weight <= 0 || newExercise.reps <= 0) {
      alert("Please enter a valid exercise name, weight, and reps.");
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .insert({ ...newExercise, workout_id: workoutId })
        .select()
        .single();

      if (error) throw error;

      setExercises([...exercises, data]);
      setNewExercise({ name: "", weight: 0, reps: 0, workout_id: workoutId });
    } catch (error) {
      console.error("Error saving exercise:", error);
      alert("Failed to save exercise. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Exercise Log</h2>
      <ul className="space-y-2 mb-6">
        {exercises.length === 0 ? (
          <li className="text-gray-600">No exercises added yet.</li>
        ) : (
          exercises.map((ex, index) => (
            <li
              key={ex.id || index}
              className="bg-gray-50 p-3 rounded-md text-gray-700"
            >
              {ex.name}: {ex.weight}lbs x {ex.reps} reps
            </li>
          ))
        )}
      </ul>
      <div className="flex space-x-4 items-center">
        <input
          type="text"
          placeholder="Exercise Name"
          value={newExercise.name}
          onChange={(e) =>
            setNewExercise({ ...newExercise, name: e.target.value })
          }
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          disabled={isSaving}
        />
        <input
          type="number"
          placeholder="lbs"
          value={newExercise.weight || ""}
          onChange={(e) =>
            setNewExercise({ ...newExercise, weight: Number(e.target.value) })
          }
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-24"
          disabled={isSaving}
        />
        <input
          type="number"
          placeholder="reps"
          value={newExercise.reps || ""}
          onChange={(e) =>
            setNewExercise({ ...newExercise, reps: Number(e.target.value) })
          }
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 w-24"
          disabled={isSaving}
        />
        <button
          onClick={saveExercise}
          className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={isSaving}
          aria-label="Add Exercise"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
