/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Exercises from "@/components/Exercises"; // Updated from ExerciseLog
import RestTimer from "@/components/RestTimer";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Exercise } from "@/types";
import Link from "next/link";
import PlanItem from "@/components/PlanItem";

// Define the Plan type
type Plan = {
  id: string;
  name: string;
};

// Define props for the DeleteConfirmationModal
type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
};

// Define props for the Toast component
type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
};

// DeleteConfirmationModal component
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Delete Workout Plan
        </h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the workout plan "{planName}"?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast component
const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
        {message}
      </div>
    </div>
  );
};

// Utility function to format seconds into HH:MM:SS
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function Workout() {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [planName, setPlanName] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPreviousWorkouts, setShowPreviousWorkouts] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch user session and plans on mount
  useEffect(() => {
    async function fetchUserAndPlans() {
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
    }
    fetchUserAndPlans();
  }, [router]);

  // Set workoutId from query parameter if provided
  useEffect(() => {
    const initialWorkoutId = searchParams.get("workoutId");
    if (initialWorkoutId && !workoutId) {
      setWorkoutId(initialWorkoutId);
    }
  }, [searchParams, workoutId]);

  // Fetch exercises when workoutId changes
  useEffect(() => {
    async function fetchExercises() {
      if (!workoutId) return;
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("workout_id", workoutId);
      if (error) {
        console.error(
          "Error fetching exercises:",
          error.message,
          error.details
        );
        alert("Failed to load exercises. Please try again.");
      } else {
        setExercises(data || []);
      }
    }
    fetchExercises();
  }, [workoutId]);

  // Update elapsed time every second when workout is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (workoutId && workoutStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - workoutStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutId, workoutStartTime]);

  // Start a new workout manually
  async function startWorkout() {
    if (!userId) {
      alert("Please log in first!");
      return;
    }
    setIsStartingWorkout(true);
    try {
      const { data, error } = await supabase
        .from("workouts")
        .insert({ name: new Date().toLocaleString(), user_id: userId })
        .select()
        .single();
      if (error) throw error;
      setWorkoutId(data.id);
      setWorkoutStartTime(Date.now()); // Set start time
    } catch (error) {
      console.error("Error starting workout:", error);
      alert("Failed to start workout. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  }

  // Start a workout from a plan
  async function startFromPlan(planId: string) {
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

      const exercises = planExercises.map((ex) => ({
        workout_id: workout.id,
        name: ex.name,
        weight: ex.weight,
        reps: ex.reps,
      }));
      const { error: insertError } = await supabase
        .from("exercises")
        .insert(exercises);
      if (insertError) throw insertError;

      setWorkoutId(workout.id);
      setWorkoutStartTime(Date.now()); // Set start time
    } catch (error) {
      console.error("Error starting workout from plan:", error);
      alert("Failed to start workout from plan. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  }

  // Save current workout as a plan and to workouts table
  async function saveWorkout() {
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

      // Update workout with name and total_time
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
      setWorkoutStartTime(null); // Reset workout time
      setElapsedTime(0);
      setToastMessage("Workout saved successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // Delete a plan and its associated exercises
  async function deletePlan(planId: string) {
    if (!userId) {
      alert("User not authenticated.");
      return;
    }
    try {
      const { error: exercisesError } = await supabase
        .from("plan_exercises")
        .delete()
        .eq("plan_id", planId);
      if (exercisesError) {
        console.error(
          "Error deleting plan exercises:",
          exercisesError.message,
          exercisesError.details
        );
        throw exercisesError;
      }

      const { error: planError } = await supabase
        .from("plans")
        .delete()
        .eq("id", planId)
        .eq("user_id", userId);
      if (planError) {
        console.error(
          "Error deleting plan:",
          planError.message,
          planError.details
        );
        throw planError;
      }

      setPlans(plans.filter((p) => p.id !== planId));
      setToastMessage("Plan deleted successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert(
        "Failed to delete plan. Please check your permissions or try again."
      );
    }
  }

  // Handle ending the workout
  function endWorkout() {
    setShowModal(true);
  }

  // Confirm save and end
  async function confirmEndWorkout(shouldSave: boolean) {
    if (shouldSave) {
      await saveWorkout();
    } else {
      if (workoutId && userId) {
        try {
          const { error: exercisesError } = await supabase
            .from("exercises")
            .delete()
            .eq("workout_id", workoutId);
          if (exercisesError) {
            console.error(
              "Error deleting unsaved exercises:",
              exercisesError.message,
              exercisesError.details
            );
            throw exercisesError;
          }

          const { error: workoutError } = await supabase
            .from("workouts")
            .delete()
            .eq("id", workoutId)
            .eq("user_id", userId);
          if (workoutError) {
            console.error(
              "Error deleting unsaved workout:",
              workoutError.message,
              workoutError.details
            );
            throw workoutError;
          }
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
      setWorkoutStartTime(null); // Reset workout time
      setElapsedTime(0);
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (plan: Plan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const handleDeleteClose = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  // Confirm delete action
  const handleDeleteConfirm = () => {
    if (planToDelete) {
      deletePlan(planToDelete.id);
    }
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  // Handle navigation away (cleanup if unsaved)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (workoutId) {
        event.preventDefault();
        event.returnValue =
          "You have an unsaved workout. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [workoutId]);

  // Toast close handler
  const handleToastClose = () => {
    setShowToast(false);
    setToastMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main
        className={`max-w-4xl mx-auto p-6 ${
          showModal || showDeleteModal ? "blur-sm" : ""
        }`}
      >
        {!workoutId ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2
              className="text-2xl font-semibold text-gray-800 mb-4 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={() => setShowPreviousWorkouts(!showPreviousWorkouts)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPreviousWorkouts(!showPreviousWorkouts);
                }
              }}
              role="button"
              tabIndex={0}
            >
              Previous Workouts
            </h2>
            {showPreviousWorkouts && (
              <>
                {plans.length === 0 ? (
                  <p className="text-gray-600 mb-6">
                    No previous workout plans saved.
                  </p>
                ) : (
                  <ul className="max-h-96 overflow-y-scroll space-y-3 mb-6">
                    {plans.map((plan) => (
                      <PlanItem
                        key={plan.id}
                        plan={plan}
                        onStart={startFromPlan}
                        onOpenDeleteModal={openDeleteModal}
                        isStartingWorkout={isStartingWorkout}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
            <button
              onClick={startWorkout}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-lg font-semibold"
              disabled={!userId || isStartingWorkout}
            >
              {isStartingWorkout ? "Starting..." : "Start New Workout"}
            </button>
            <div className="mt-4">
              <Link href="/progress">
                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-lg font-semibold">
                  View Progress
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-center mb-6">
              <div className="text-5xl font-mono text-gray-700">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <Exercises
              workoutId={workoutId}
              exercises={exercises}
              setExercises={setExercises}
            />
            <RestTimer />
            <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <input
                type="text"
                placeholder="Workout Name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <button
                onClick={endWorkout}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold"
              >
                End Workout
              </button>
            </div>
          </div>
        )}
      </main>
      {/* End Workout Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Would you like to save this workout?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => confirmEndWorkout(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                No
              </button>
              <button
                onClick={() => confirmEndWorkout(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleDeleteClose}
          onConfirm={handleDeleteConfirm}
          planName={planToDelete.name}
        />
      )}
      {/* Toast Notification */}
      <Toast
        message={toastMessage || ""}
        isVisible={showToast}
        onClose={handleToastClose}
      />
    </div>
  );
}
