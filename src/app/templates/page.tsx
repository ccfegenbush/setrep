"use client";

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

type Template = {
  id: string;
  name: string;
};

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const router = useRouter();

  // Fetch user session and templates on mount
  useEffect(() => {
    async function fetchUserAndTemplates() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);
      const { data, error } = await supabase
        .from("templates")
        .select("id, name")
        .eq("user_id", session.user.id);
      if (error) {
        console.error("Error fetching templates:", error);
      } else {
        setTemplates(data || []);
      }
    }
    fetchUserAndTemplates();
  }, [router]);

  // Function to start a workout from a template
  async function startFromTemplate(templateId: string) {
    if (!userId) return;
    setIsStarting(true);
    try {
      // Fetch template name
      const { data: templateData, error: templateError } = await supabase
        .from("templates")
        .select("name")
        .eq("id", templateId)
        .single();
      if (templateError) throw templateError;

      // Fetch template exercises
      const { data: templateExercises, error: exercisesError } = await supabase
        .from("template_exercises")
        .select("name, weight, reps")
        .eq("template_id", templateId);
      if (exercisesError) throw exercisesError;

      // Create new workout with name based on template
      const workoutName = `Workout from ${templateData.name}`;
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({ name: workoutName, user_id: userId })
        .select()
        .single();
      if (workoutError) throw workoutError;

      // Insert exercises into the new workout
      const exercises = templateExercises.map((ex) => ({
        workout_id: workout.id,
        name: ex.name,
        weight: ex.weight,
        reps: ex.reps,
      }));
      const { error: insertError } = await supabase
        .from("exercises")
        .insert(exercises);
      if (insertError) throw insertError;

      // Redirect to workout page with new workout ID
      router.push(`/workout?workoutId=${workout.id}`);
    } catch (error) {
      console.error("Error starting workout from template:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <main className="p-4">
      <Header />
      <h1 className="text-2xl font-bold">Workout Templates</h1>
      {templates.length === 0 ? (
        <p>No templates found.</p>
      ) : (
        <ul>
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex justify-between items-center py-2"
            >
              <span>{template.name}</span>
              <button
                onClick={() => startFromTemplate(template.id)}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isStarting}
              >
                {isStarting ? "Starting..." : "Start"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
