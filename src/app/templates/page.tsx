"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string;
  template_exercises: { name: string; weight: number; reps: number }[];
};

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndTemplates() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
      const { data, error: fetchError } = await supabase
        .from("templates")
        .select("id, name, template_exercises (name, weight, reps)")
        .eq("user_id", session.user.id);
      if (fetchError) {
        console.error(fetchError);
      } else {
        setTemplates(data || []);
      }
    }
    fetchUserAndTemplates();
  }, [router]);

  async function startFromTemplate(templateId: string) {
    if (!userId) return;
    const { data: template, error } = await supabase
      .from("templates")
      .select("name, template_exercises (name, weight, reps)")
      .eq("id", templateId)
      .single();
    if (error) {
      alert(`Failed to load template: ${error.message}`);
      return;
    }
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({ name: template.name, user_id: userId })
      .select()
      .single();
    if (workoutError) {
      alert(`Failed to start workout: ${workoutError.message}`);
      return;
    }
    const exercises = template.template_exercises.map((ex) => ({
      workout_id: workout.id,
      name: ex.name,
      weight: ex.weight,
      reps: ex.reps,
    }));
    const { error: exercisesError } = await supabase
      .from("exercises")
      .insert(exercises);
    if (exercisesError) {
      alert(`Failed to add exercises: ${exercisesError.message}`);
    } else {
      router.push("/workout"); // Redirect to workout page
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Workout Templates</h1>
      {templates.length === 0 ? (
        <p className="mt-4">No templates yet. Create one from a workout!</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {templates.map((template) => (
            <li key={template.id} className="flex items-center justify-between">
              <span>{template.name}</span>
              <button
                onClick={() => startFromTemplate(template.id)}
                className="px-4 py-1 bg-blue-500 text-white rounded"
              >
                Start
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
