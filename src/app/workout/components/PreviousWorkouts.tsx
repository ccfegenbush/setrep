"use client";

import Link from "next/link";
import PlanItem from "@/components/PlanItem";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

type Plan = { id: string; name: string };

type PreviousWorkoutsProps = {
  plans: Plan[];
  isStartingWorkout: boolean;
  onStartWorkout: () => void;
  onStartFromPlan: (plan: Plan) => void; // Updated to accept Plan
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
    <div className="bg-whoop-card rounded-xl p-6 sm:p-8 shadow-lg transition-all duration-300">
      <div
        className="flex items-center justify-between mb-4 cursor-pointer hover:text-whoop-green transition-colors duration-200"
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
        <h2 className="text-xl font-semibold text-whoop-white">
          Previous Workouts
        </h2>
        {showPreviousWorkouts ? (
          <FaChevronUp className="text-whoop-gray text-lg" />
        ) : (
          <FaChevronDown className="text-whoop-gray text-lg" />
        )}
      </div>
      {showPreviousWorkouts && (
        <>
          {plans.length === 0 ? (
            <p className="text-whoop-gray/80 text-sm mb-4">
              No previous plans saved.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-whoop-cyan/50 scrollbar-track-whoop-dark/80">
              {plans.map((plan) => (
                <PlanItem
                  key={plan.id}
                  plan={plan}
                  onStart={(plan: Plan) => onStartFromPlan(plan)} // Updated to pass Plan
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
        className="w-full px-5 py-3 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-green/80 hover:to-whoop-cyan/80 transition-all duration-200 disabled:bg-whoop-gray/50 disabled:text-whoop-dark/70 disabled:cursor-not-allowed text-base"
        disabled={isStartingWorkout}
      >
        {isStartingWorkout ? "Starting..." : "Start New Workout"}
      </button>
      <div className="mt-4">
        <Link href="/progress">
          <button className="w-full px-5 py-3 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-cyan/80 hover:to-whoop-dark/80 transition-all duration-200 text-base">
            View Progress
          </button>
        </Link>
      </div>
    </div>
  );
}
