import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { FaTrash } from "react-icons/fa";

type Plan = { id: string; name: string };

type PlanItemProps = {
  plan: Plan;
  onStart: (plan: Plan) => void; // Updated to accept Plan
  onOpenDeleteModal: (plan: Plan) => void;
  isStartingWorkout: boolean;
};

const PlanItem: React.FC<PlanItemProps> = ({
  plan,
  onStart,
  onOpenDeleteModal,
  isStartingWorkout,
}) => {
  const [swipeProgress, setSwipeProgress] = useState(0);

  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      const { deltaX } = eventData;
      if (deltaX < 0) setSwipeProgress(Math.min(Math.abs(deltaX), 100));
      else setSwipeProgress(0);
    },
    onSwipedLeft: () => {
      if (swipeProgress >= 100) onOpenDeleteModal(plan);
      setSwipeProgress(0);
    },
    onSwiped: () => setSwipeProgress(0),
    trackMouse: true,
  });

  const transform = `translateX(-${swipeProgress}px)`;
  const deleteOpacity = swipeProgress / 100;

  return (
    <li className="relative overflow-hidden rounded-xl shadow-sm">
      <div
        className="absolute inset-0 flex items-center justify-end pr-4 bg-red-600 transition-opacity duration-200"
        style={{ opacity: deleteOpacity }}
      >
        <FaTrash className="w-5 h-5 text-whoop-white" />
      </div>
      <div
        {...swipeHandlers}
        className="flex justify-between items-center bg-whoop-dark/50 p-4 transition-transform duration-200 relative z-10"
        style={{ transform }}
      >
        <span className="text-whoop-white text-base font-medium">
          {plan.name}
        </span>
        <button
          onClick={() => onStart(plan)} // Pass the full Plan object
          className="px-4 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-green/80 hover:to-whoop-cyan/80 transition-all duration-200 disabled:bg-whoop-gray/50 disabled:cursor-not-allowed text-sm"
          disabled={isStartingWorkout}
        >
          {isStartingWorkout ? "Starting..." : "Start"}
        </button>
      </div>
    </li>
  );
};

export default PlanItem;
