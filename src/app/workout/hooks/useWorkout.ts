/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/lib/supabase";
import { Exercise } from "@/types";
import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
};

type RouterType = ReturnType<typeof useRouter>;

type UseWorkoutProps = {
  setUserId: Dispatch<SetStateAction<string | null>>;
  setPlans: Dispatch<SetStateAction<Plan[]>>;
  setWorkoutId: Dispatch<SetStateAction<string | null>>;
  setExercises: Dispatch<SetStateAction<Exercise[]>>;
  setPlanName: Dispatch<SetStateAction<string>>;
  setIsStartingWorkout: Dispatch<SetStateAction<boolean>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowToast: Dispatch<SetStateAction<boolean>>;
  setToastMessage: Dispatch<SetStateAction<string | null>>;
  router: RouterType;
  workoutId: string | null;
  userId: string | null;
  exercises: Exercise[];
  planName: string;
  plans: Plan[];
};

export function useWorkout({
  setUserId,
  setPlans,
  setWorkoutId,
  setExercises,
  setPlanName,
  setIsStartingWorkout,
  setIsSaving,
  setShowModal,
  setShowToast,
  setToastMessage,
  router,
  workoutId,
  userId,
  exercises,
  planName,
  plans,
}: UseWorkoutProps) {
  const fetchUserAndPlans = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) {
      router.push("/login");
    } else {
      setUserId(session.user.id);
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("id, name")
        .eq("user_id", session.user.id);
      if (planError) {
        console.error(
          "Error fetching plans:",
          planError.message,
          planError.details
        );
        alert("Failed to load plans. Please try again.");
      } else {
        setPlans(planData || []);
      }
    }
  };

  const fetchExercises = async () => {
    if (!workoutId) return;
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .eq("workout_id", workoutId);
    if (error) {
      console.error("Error fetching exercises:", error.message, error.details);
      alert("Failed to load exercises. Please try again.");
    } else {
      setExercises(data || []);
    }
  };

  const startWorkout = async () => {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setIsStartingWorkout(true);
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({ name: "New Workout", user_id: userId })
        .select()
        .single();
      if (error) throw error;
      setWorkoutId(data.id);
      setWorkoutStartTime(Date.now());
    } catch (error) {
      console.error("Error starting workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const startFromPlan = async (planId: string) => {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setIsStartingWorkout(true);
    try {
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("name")
        .eq("id", planId)
        .single();
      if (planError) throw planError;

      const { data: planExercises, error: exercisesError } = await supabase
        .from("plan_exercises")
        .select("name, weight, reps")
        .eq("plan_id", planId);
      if (exercisesError) throw exercisesError;

      const workoutName = `${planData.name}`;
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({ name: workoutName, user_id: userId })
        .select()
        .single();
      if (workoutError) throw workoutError;

      const exercisesToInsert = planExercises.map((ex) => ({
        workout_id: workout.id,
        name: ex.name,
        weight: ex.weight,
        reps: ex.reps,
      }));
      const { error: insertError } = await supabase
        .from("exercises")
        .insert(exercisesToInsert);
      if (insertError) throw insertError;

      setWorkoutId(workout.id);
      setWorkoutStartTime(Date.now());
    } catch (error) {
      console.error("Error starting workout from plan:", error);
      alert("Failed to start workout from plan. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const saveWorkout = async () => {
    if (!workoutId) {
      alert("No active workout to save.");
      return;
    }
    setIsSaving(true);
    try {
      const { data: exercisesData, error: fetchError } = await supabase
        .from("exercises")
        .select("name, weight, reps")
        .eq("workout_id", workoutId);
      if (fetchError) throw fetchError;

      const trimmedName = planName.trim();
      const workoutName = trimmedName || new Date().toLocaleString();
      const planNameFinal = trimmedName || new Date().toLocaleString();

      const { error: updateWorkoutError } = await supabase
        .from("workouts")
        .update({ name: workoutName, total_time: elapsedTime })
        .eq("id", workoutId)
        .eq("user_id", userId);
      if (updateWorkoutError) throw updateWorkoutError;

      const { data: plan, error: planError } = await supabase
        .from("plans")
        .insert({ name: planNameFinal, user_id: userId })
        .select()
        .single();
      if (planError) throw planError;

      const planExercises = exercisesData.map((exercise) => ({
        plan_id: plan.id,
        name: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
      }));
      const { error: exercisesError } = await supabase
        .from("plan_exercises")
        .insert(planExercises);
      if (exercisesError) throw exercisesError;

      setPlans([...plans, { id: plan.id, name: planNameFinal }]);
      setWorkoutId(null);
      setPlanName("");
      setShowModal(false);
      setWorkoutStartTime(null);
      setElapsedTime(0);
      setToastMessage("Workout saved successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!userId) {
      alert("User not authenticated.");
      return;
    }
    try {
      const { error: exercisesError } = await supabase
        .from("plan_exercises")
        .delete()
        .eq("plan_id", planId);
      if (exercisesError) throw exercisesError;

      const { error: planError } = await supabase
        .from("plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", userId);
      if (planError) throw planError;

      setPlans(plans.filter((p) => p.id !== planId));
      setToastMessage("Plan deleted successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert(
        "Failed to delete plan. Please check your permissions or try again."
      );
    }
  };

  const confirmEndWorkout = async (shouldSave: boolean) => {
    if (shouldSave) {
      await saveWorkout();
    } else {
      if (workoutId && userId) {
        try {
          const { error: exercisesError } = await supabase
            .from("exercises")
            .delete()
            .eq("workout_id", workoutId);
          if (exercisesError) throw exercisesError;

          const { error: workoutError } = await supabase
            .from("workouts")
            .delete()
            .eq("id", workoutId)
            .eq("user_id", userId);
          if (workoutError) throw workoutError;
        } catch (error) {
          console.error("Error deleting unsaved workout:", error);
          alert(
            "Failed to clean up unsaved workout. It may remain in the database."
          );
        }
      }
      setWorkoutId(null);
      setExercises([]);
      setPlanName("");
      setShowModal(false);
      setWorkoutStartTime(null);
      setElapsedTime(0);
    }
  };

  // Memoize the returned functions to prevent re-creation on every render
  return useMemo(
    () => ({
      fetchUserAndPlans,
      fetchExercises,
      startWorkout,
      startFromPlan,
      saveWorkout,
      deletePlan,
      confirmEndWorkout,
    }),
    [
      userId,
      workoutId,
      exercises,
      planName,
      plans,
      router,
      setUserId,
      setPlans,
      setWorkoutId,
      setExercises,
      setPlanName,
      setIsStartingWorkout,
      setIsSaving,
      setShowModal,
      setShowToast,
      setToastMessage,
    ]
  );
}

// Note: These states should be managed elsewhere or passed as props
let workoutStartTime: number | null = null;
let elapsedTime: number = 0;

function setWorkoutStartTime(time: number | null) {
  workoutStartTime = time;
}

function setElapsedTime(time: number) {
  elapsedTime = time;
}

export function useWorkoutTime() {
  const [localElapsedTime, setLocalElapsedTime] = useState(elapsedTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - workoutStartTime!) / 1000);
        setElapsedTime(elapsed);
        setLocalElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, []);

  return localElapsedTime;
}
