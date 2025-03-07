"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

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

export default function Exercises({
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
    <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
      <h2 className="text-2xl font-semibold text-whoop-white mb-4">
        Exercises
      </h2>
      <ul className="space-y-3 mb-6">
        {exercises.length === 0 ? (
          <li className="text-whoop-gray">No exercises added yet.</li>
        ) : (
          exercises.map((ex, index) => (
            <li
              key={ex.id || index}
              className="bg-whoop-dark p-3 rounded-xl text-whoop-white border border-whoop-cyan/30"
            >
              {ex.name}: {ex.weight}lbs x {ex.reps} reps
            </li>
          ))
        )}
      </ul>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 items-center">
        <input
          type="text"
          placeholder="Exercise Name"
          value={newExercise.name}
          onChange={(e) =>
            setNewExercise({ ...newExercise, name: e.target.value })
          }
          className="w-full sm:flex-1 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray disabled:bg-whoop-gray/50"
          disabled={isSaving}
        />
        <div className="flex space-x-4 w-full sm:w-auto">
          <input
            type="number"
            placeholder="lbs"
            value={newExercise.weight || ""}
            onChange={(e) =>
              setNewExercise({ ...newExercise, weight: Number(e.target.value) })
            }
            className="w-24 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray disabled:bg-whoop-gray/50"
            disabled={isSaving}
          />
          <input
            type="number"
            placeholder="reps"
            value={newExercise.reps || ""}
            onChange={(e) =>
              setNewExercise({ ...newExercise, reps: Number(e.target.value) })
            }
            className="w-24 p-4 bg-whoop-dark text-whoop-white border border-whoop-cyan/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-whoop-green placeholder-whoop-gray disabled:bg-whoop-gray/50"
            disabled={isSaving}
          />
          <button
            onClick={saveExercise}
            className="p-3 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:scale-100 disabled:shadow-none flex-shrink-0"
            disabled={isSaving}
            aria-label="Add Exercise"
          >
            <FaPlus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
