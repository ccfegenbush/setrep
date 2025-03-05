"use client";

import { supabase } from "@/lib/supabase";
import ExerciseLog from "@/components/ExerciseLog";
import RestTimer from "@/components/RestTimer";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Workout() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const router = useRouter();

  // Fetch user session on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
        } else {
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  // Start a new workout
  async function startWorkout() {
    if (!userId) return; // Button is disabled, but extra safety
    setIsStartingWorkout(true);
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({ name: "New Workout", user_id: userId })
        .select()
        .single();
      if (error) throw error;
      setWorkoutId(data.id);
    } catch (error) {
      console.error("Error starting workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  }

  // Save current workout as a template
  async function saveAsTemplate() {
    const trimmedName = templateName.trim();
    if (!workoutId || !trimmedName) {
      alert("Please start a workout and enter a valid template name.");
      return;
    }
    setIsSavingTemplate(true);
    try {
      // Fetch exercises for the workout
      const { data: exercises, error: fetchError } = await supabase
        .from("exercises")
        .select("name, weight, reps")
        .eq("workout_id", workoutId);
      if (fetchError) throw fetchError;

      // Insert the template
      const { data: template, error: templateError } = await supabase
        .from("templates")
        .insert({ name: trimmedName, user_id: userId })
        .select()
        .single();
      if (templateError) throw templateError;

      // Prepare and insert template exercises
      const templateExercises = exercises.map((exercise) => ({
        template_id: template.id,
        name: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
      }));
      const { error: exercisesError } = await supabase
        .from("template_exercises")
        .insert(templateExercises);
      if (exercisesError) throw exercisesError;

      // Success feedback
      alert("Template saved successfully!");
      setTemplateName("");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    } finally {
      setIsSavingTemplate(false);
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">SetRep Workout</h1>
      {!workoutId ? (
        <button
          onClick={startWorkout}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!userId || isStartingWorkout}
        >
          {isStartingWorkout ? "Starting..." : "Begin Workout"}
        </button>
      ) : (
        <div>
          <ExerciseLog workoutId={workoutId} />
          <RestTimer />
          <div className="mt-4">
            <input
              type="text"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="p-2 border rounded mr-2"
            />
            <button
              onClick={saveAsTemplate}
              className="px-4 py-2 bg-green-500 text-white rounded"
              disabled={isSavingTemplate}
            >
              {isSavingTemplate ? "Saving..." : "Save as Template"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
