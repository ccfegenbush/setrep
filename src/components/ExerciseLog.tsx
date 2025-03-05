"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type Exercise = { name: string; weight: number; reps: number };

export default function ExerciseLog({ workoutId }: { workoutId: string }) {
  const [exercise, setExercise] = useState<Exercise>({
    name: "",
    weight: 0,
    reps: 0,
  });

  async function saveExercise() {
    const { error } = await supabase
      .from("exercises")
      .insert({ ...exercise, workout_id: workoutId });
    if (error) console.error(error);
    else setExercise({ name: "", weight: 0, reps: 0 });
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Exercise Name"
        value={exercise.name}
        onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Weight"
        value={exercise.weight}
        onChange={(e) =>
          setExercise({ ...exercise, weight: Number(e.target.value) })
        }
      />
      <input
        type="number"
        placeholder="Reps"
        value={exercise.reps}
        onChange={(e) =>
          setExercise({ ...exercise, reps: Number(e.target.value) })
        }
      />
      <button onClick={saveExercise}>Save</button>
    </div>
  );
}
