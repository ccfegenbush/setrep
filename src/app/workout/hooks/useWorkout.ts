/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from "@/lib/supabase";
import { Dispatch, SetStateAction, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
    if (!session) {
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
        setToastMessage("Failed to load plans. Please try again.");
        setShowToast(true);
      } else {
        setPlans(planData || []);
      }
    }
  };

  const fetchExercises = async () => {
    if (!workoutId) return;
    const { data: exerciseData, error: exerciseError } = await supabase
      .from("exercises")
      .select("id, name, workout_id")
      .eq("workout_id", workoutId);
    if (exerciseError) {
      console.error(
        "Error fetching exercises:",
        exerciseError.message,
        exerciseError.details
      );
      setToastMessage("Failed to load exercises. Please try again.");
      setShowToast(true);
      return;
    }

    // Fetch sets separately
    const exerciseIds = exerciseData.map((ex) => ex.id);
    const { data: setsData, error: setsError } = await supabase
      .from("sets")
      .select("*")
      .in("exercise_id", exerciseIds);
    if (setsError) {
      console.error(
        "Error fetching sets:",
        setsError.message,
        setsError.details
      );
      setToastMessage("Failed to load exercise sets. Please try again.");
      setShowToast(true);
      return;
    }

    const exercisesWithSets = exerciseData.map((exercise) => ({
      ...exercise,
      sets: setsData.filter((set) => set.exercise_id === exercise.id) || [],
    }));
    setExercises(exercisesWithSets || []);
  };

  const startWorkout = async () => {
    if (!userId) {
      setToastMessage("Please log in first!");
      setShowToast(true);
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
      setToastMessage("Failed to start workout. Please try again.");
      setShowToast(true);
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const startFromPlan = async (plan: Plan) => {
    if (!userId) {
      setToastMessage("Please log in first!");
      setShowToast(true);
      return;
    }
    setIsStartingWorkout(true);
    try {
      console.log("Starting workout from plan with ID:", plan.id);
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("name")
        .eq("id", plan.id)
        .single();
      if (planError) {
        console.error(
          "Error fetching plan:",
          planError.message,
          planError.details
        );
        throw new Error(`Failed to fetch plan: ${planError.message}`);
      }
      console.log("Fetched plan data:", planData);

      const { data: planExercises, error: exercisesError } = await supabase
        .from("plan_exercises")
        .select("name")
        .eq("plan_id", plan.id);
      if (exercisesError) {
        console.error(
          "Error fetching plan exercises:",
          exercisesError.message,
          exercisesError.details
        );
        throw new Error(
          `Failed to fetch plan exercises: ${exercisesError.message}`
        );
      }
      console.log("Fetched plan exercises:", planExercises);

      const workoutName = `${planData.name}`;
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert({ name: workoutName, user_id: userId })
        .select()
        .single();
      if (workoutError) {
        console.error(
          "Error creating workout:",
          workoutError.message,
          workoutError.details
        );
        throw new Error(`Failed to create workout: ${workoutError.message}`);
      }
      console.log("Created workout:", workout);

      const exercisesToInsert = planExercises.map((ex: { name: string }) => ({
        workout_id: workout.id,
        name: ex.name,
        sets: [],
      }));
      const { data: insertedExercises, error: insertError } = await supabase
        .from("exercises")
        .insert(exercisesToInsert)
        .select();
      if (insertError) {
        console.error(
          "Error inserting exercises:",
          insertError.message,
          insertError.details
        );
        throw new Error(`Failed to insert exercises: ${insertError.message}`);
      }
      console.log("Inserted exercises:", insertedExercises);

      setExercises(insertedExercises || []);
      setPlanName(workoutName);
      setWorkoutId(workout.id);
      setWorkoutStartTime(Date.now());
    } catch (error: any) {
      console.error("Error starting workout from plan:", error);
      setToastMessage(error.message || "Failed to start workout from plan.");
      setShowToast(true);
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const saveWorkout = async () => {
    if (!workoutId) {
      setToastMessage("No active workout to save.");
      setShowToast(true);
      return;
    }
    setIsSaving(true);
    try {
      const { data: exercisesData, error: fetchError } = await supabase
        .from("exercises")
        .select("id, name, workout_id")
        .eq("workout_id", workoutId);
      if (fetchError) {
        console.error(
          "Error fetching exercises for save:",
          fetchError.message,
          fetchError.details
        );
        throw fetchError;
      }

      const exerciseIds = exercisesData.map((ex) => ex.id);
      const { data: setsData, error: setsError } = await supabase
        .from("sets")
        .select("*")
        .in("exercise_id", exerciseIds);
      if (setsError) {
        console.error(
          "Error fetching sets:",
          setsError.message,
          setsError.details
        );
        throw setsError;
      }
      const exercisesWithSets = exercisesData.map((exercise) => ({
        ...exercise,
        sets: setsData.filter((set) => set.exercise_id === exercise.id) || [],
      }));

      const trimmedName = planName.trim();
      const workoutName =
        trimmedName || `Workout on ${new Date().toLocaleDateString()}`;
      console.log(
        "Saving workout with name:",
        workoutName,
        "and total_time:",
        elapsedTime
      );

      const { data: updatedWorkout, error: updateWorkoutError } = await supabase
        .from("workouts")
        .update({ name: workoutName, total_time: elapsedTime })
        .eq("id", workoutId)
        .eq("user_id", userId)
        .select();
      if (updateWorkoutError) {
        console.error(
          "Error updating workout:",
          updateWorkoutError.message,
          updateWorkoutError.details
        );
        throw updateWorkoutError;
      }
      console.log("Updated workout:", updatedWorkout);

      const { data: plan, error: planError } = await supabase
        .from("plans")
        .insert({ name: workoutName, user_id: userId })
        .select()
        .single();
      if (planError) throw planError;

      const planExercises = exercisesWithSets.flatMap((exercise: Exercise) =>
        exercise.sets.map((set: Set) => ({
          plan_id: plan.id,
          name: exercise.name,
          weight: set.weight,
          reps: set.reps,
        }))
      );
      const { error: exercisesError } = await supabase
        .from("plan_exercises")
        .insert(planExercises);
      if (exercisesError) throw exercisesError;

      setPlans([...plans, { id: plan.id, name: workoutName }]);
      setWorkoutId(null);
      setPlanName("");
      setShowModal(false);
      setWorkoutStartTime(null);
      const finalElapsedTime = elapsedTime;
      setElapsedTime(0);
      setToastMessage(
        `Workout "${workoutName}" saved successfully! (Total time: ${formatTime(
          finalElapsedTime
        )})`
      );
      setShowToast(true);
    } catch (error) {
      console.error("Error saving workout:", error);
      setToastMessage("Failed to save workout. Please try again.");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!userId) {
      setToastMessage("User not authenticated.");
      setShowToast(true);
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
      setToastMessage(
        "Failed to delete plan. Please check your permissions or try again."
      );
      setShowToast(true);
    }
  };

  const confirmEndWorkout = async (shouldSave: boolean) => {
    if (shouldSave) {
      await saveWorkout();
    } else {
      if (workoutId && userId) {
        try {
          const { data: exercisesData } = await supabase
            .from("exercises")
            .select("id")
            .eq("workout_id", workoutId);

          if (exercisesData && exercisesData.length > 0) {
            const exerciseIds = exercisesData.map((ex: { id: any }) => ex.id);
            await supabase.from("sets").delete().in("exercise_id", exerciseIds);
          }

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
          setToastMessage(
            "Failed to clean up unsaved workout. It may remain in the database."
          );
          setShowToast(true);
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

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

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
