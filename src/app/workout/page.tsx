/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import PlanItem from "@/components/PlanItem";
import ActiveWorkout from "./components/ActiveWorkout";
import PreviousWorkouts from "./components/PreviousWorkouts";
import EndWorkoutModal from "./components/EndWorkoutModal";
import DeleteModal from "./components/DeleteModal";
import Toast from "./components/Toast";
import WeightTracking from "@/components/WeightTracking";
import { useWorkout } from "./hooks/useWorkout";
import { FaDumbbell } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

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

  return null;
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
    <div className="min-h-screen bg-whoop-dark text-whoop-white font-sans">
      <Header />
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${
          showModal || showDeleteModal ? "blur-sm" : ""
        }`}
      >
        <div className="flex items-center mb-10">
          <FaDumbbell className="text-whoop-green text-3xl sm:text-4xl mr-4 transition-transform hover:scale-105" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-whoop-white to-whoop-cyan bg-clip-text text-transparent">
            Workouts
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="text-whoop-gray/70 text-lg animate-pulse">
              Loading workout parameters...
            </div>
          }
        >
          <WorkoutParams setWorkoutId={setWorkoutId} />
        </Suspense>

        {workoutId ? (
          <div className="bg-whoop-card rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300">
            <ActiveWorkout
              workoutId={workoutId}
              exercises={exercises}
              setExercises={setExercises}
              planName={planName}
              setPlanName={setPlanName}
              onEndWorkout={() => setShowModal(true)}
              setToastMessage={setToastMessage}
              setShowToast={setShowToast}
            />
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-whoop-card rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300">
              <PreviousWorkouts
                plans={plans}
                isStartingWorkout={isStartingWorkout}
                onStartWorkout={workoutHandlers.startWorkout}
                onStartFromPlan={(plan: Plan) => {
                  setPlanName(plan.name);
                  workoutHandlers.startFromPlan(plan);
                }}
                onOpenDeleteModal={(plan) => {
                  setPlanToDelete(plan);
                  setShowDeleteModal(true);
                }}
              />
            </div>
            <div className="bg-whoop-card rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300">
              <WeightTracking />
            </div>
          </div>
        )}
      </main>

      <EndWorkoutModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={workoutHandlers.confirmEndWorkout}
      />
      <DeleteModal
        isOpen={showDeleteModal}
        itemType="plan"
        itemName={planToDelete?.name || ""}
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
