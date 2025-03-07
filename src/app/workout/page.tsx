/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Exercise } from "@/types";
import Header from "@/components/Header";
import PlanItem from "@/components/PlanItem";
import ActiveWorkout from "./components/ActiveWorkout";
import PreviousWorkouts from "./components/PreviousWorkouts";
import EndWorkoutModal from "./components/EndWorkoutModal";
import DeletePlanModal from "./components/DeletePlanModal";
import Toast from "./components/Toast";
import { useWorkout } from "./hooks/useWorkout";

// Define the Plan type
type Plan = {
  id: string;
  name: string;
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const workoutHandlers = useWorkout({
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
  });

  // Fetch user session and plans on mount
  useEffect(() => {
    workoutHandlers.fetchUserAndPlans();
  }, []); // Empty dependency array since we only want this to run once on mount

  // Set workoutId from query parameter if provided
  useEffect(() => {
    const initialWorkoutId = searchParams.get("workoutId");
    if (initialWorkoutId && !workoutId) {
      setWorkoutId(initialWorkoutId);
    }
  }, [searchParams, workoutId]);

  // Fetch exercises when workoutId changes
  useEffect(() => {
    workoutHandlers.fetchExercises();
  }, [workoutId]); // Only re-run when workoutId changes

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
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [workoutId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main
        className={`max-w-4xl mx-auto p-6 ${
          showModal || showDeleteModal ? "blur-sm" : ""
        }`}
      >
        {workoutId ? (
          <ActiveWorkout
            workoutId={workoutId}
            exercises={exercises}
            setExercises={setExercises}
            planName={planName}
            setPlanName={setPlanName}
            onEndWorkout={() => setShowModal(true)}
          />
        ) : (
          <PreviousWorkouts
            plans={plans}
            isStartingWorkout={isStartingWorkout}
            onStartWorkout={workoutHandlers.startWorkout}
            onStartFromPlan={workoutHandlers.startFromPlan}
            onOpenDeleteModal={(plan) => {
              setPlanToDelete(plan);
              setShowDeleteModal(true);
            }}
          />
        )}
      </main>
      <EndWorkoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={workoutHandlers.confirmEndWorkout}
      />
      <DeletePlanModal
        isOpen={showDeleteModal}
        planToDelete={planToDelete}
        onClose={() => {
          setShowDeleteModal(false);
          setPlanToDelete(null);
        }}
        onConfirm={() => {
          if (planToDelete) workoutHandlers.deletePlan(planToDelete.id);
          setShowDeleteModal(false);
          setPlanToDelete(null);
        }}
      />
      <Toast
        message={toastMessage || ""}
        isVisible={showToast}
        onClose={() => {
          setShowToast(false);
          setToastMessage(null);
        }}
      />
    </div>
  );
}
