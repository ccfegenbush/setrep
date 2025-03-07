"use client";

import Link from "next/link";
import PlanItem from "@/components/PlanItem";
import { useState } from "react";

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
        className="w-full px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-lg font-semibold"
        disabled={isStartingWorkout}
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
  );
}
