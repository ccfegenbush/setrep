"use client";

import Link from "next/link";
import PlanItem from "@/components/PlanItem";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Added icons for toggle

type Plan = {
  id: string;
  name: string;
};

type PreviousWorkoutsProps = {
  plans: Plan[];
  isStartingWorkout: boolean;
  onStartWorkout: () => void;
  onStartFromPlan: (planId: string) => void;
  onOpenDeleteModal: (plan: Plan) => void;
};

export default function PreviousWorkouts({
  plans,
  isStartingWorkout,
  onStartWorkout,
  onStartFromPlan,
  onOpenDeleteModal,
}: PreviousWorkoutsProps) {
  const [showPreviousWorkouts, setShowPreviousWorkouts] = useState(true);

  return (
    <div className="bg-whoop-card rounded-2xl p-6 shadow-lg shadow-glow border border-whoop-cyan/20">
      <div
        className="flex items-center justify-between mb-6 cursor-pointer hover:text-whoop-green transition-colors"
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
        <h2 className="text-2xl font-bold text-whoop-white tracking-tight">
          Previous Workouts
        </h2>
        {showPreviousWorkouts ? (
          <FaChevronUp className="text-whoop-gray text-xl" />
        ) : (
          <FaChevronDown className="text-whoop-gray text-xl" />
        )}
      </div>
      {showPreviousWorkouts && (
        <>
          {plans.length === 0 ? (
            <p className="text-whoop-gray mb-6">
              No previous workout plans saved.
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-scroll space-y-4 mb-6 scrollbar-thin scrollbar-thumb-whoop-cyan scrollbar-track-whoop-dark">
              {plans.map((plan) => (
                <PlanItem
                  key={plan.id}
                  plan={plan}
                  onStart={onStartFromPlan}
                  onOpenDeleteModal={onOpenDeleteModal}
                  isStartingWorkout={isStartingWorkout}
                />
              ))}
            </ul>
          )}
        </>
      )}
      <button
        onClick={onStartWorkout}
        className="w-full px-6 py-4 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:text-whoop-dark disabled:scale-100 disabled:shadow-none"
        disabled={isStartingWorkout}
      >
        {isStartingWorkout ? "Starting..." : "Start New Workout"}
      </button>
      <div className="mt-4">
        <Link href="/progress">
          <button className="w-full px-6 py-4 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200">
            View Progress
          </button>
        </Link>
      </div>
    </div>
  );
}
