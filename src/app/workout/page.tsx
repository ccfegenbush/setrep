/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Exercise } from "@/types";
import Header from "@/components/Header";
import PlanItem from "@/components/PlanItem";
import ActiveWorkout from "./components/ActiveWorkout";
import PreviousWorkouts from "./components/PreviousWorkouts";
import EndWorkoutModal from "./components/EndWorkoutModal";
import DeletePlanModal from "./components/DeletePlanModal";
import Toast from "./components/Toast";
import WeightTracking from "@/components/WeightTracking";
import { useWorkout } from "./hooks/useWorkout";
import { FaDumbbell } from "react-icons/fa";

// Define the Plan type
type Plan = {
  id: string;
  name: string;
};

// Child component to isolate useSearchParams
function WorkoutParams({
  setWorkoutId,
}: {
  setWorkoutId: (id: string | null) => void;
}) {
  const searchParams = useSearchParams();
  const initialWorkoutId = searchParams.get("workoutId");

  useEffect(() => {
    if (initialWorkoutId) {
      setWorkoutId(initialWorkoutId);
    }
  }, [initialWorkoutId, setWorkoutId]);

  return null; // This component only handles logic, no UI
}

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

  useEffect(() => {
    workoutHandlers.fetchUserAndPlans();
  }, []);

  useEffect(() => {
    workoutHandlers.fetchExercises();
  }, [workoutId]);

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
    <div className="min-h-screen bg-whoop-dark text-whoop-white">
      <Header />
      <main
        className={`max-w-6xl mx-auto p-6 md:p-10 ${
          showModal || showDeleteModal ? "blur-sm" : ""
        }`}
      >
        <div className="flex items-center mb-8">
          <FaDumbbell className="text-whoop-green text-4xl mr-3" />
          <h1 className="text-4xl font-bold tracking-tight">Workouts</h1>
        </div>
        <Suspense
          fallback={
            <div className="text-whoop-gray">Loading workout parameters...</div>
          }
        >
          <WorkoutParams setWorkoutId={setWorkoutId} />
        </Suspense>
        {workoutId ? (
          <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
            <ActiveWorkout
              workoutId={workoutId}
              exercises={exercises}
              setExercises={setExercises}
              planName={planName}
              setPlanName={setPlanName}
              onEndWorkout={() => setShowModal(true)}
            />
          </div>
        ) : (
          <div className="space-y-10">
            <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
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
            </div>
            <WeightTracking />
          </div>
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
