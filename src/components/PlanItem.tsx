import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { FaTrash } from "react-icons/fa";

type Plan = {
  id: string;
  name: string;
};

type PlanItemProps = {
  plan: Plan;
  onStart: (id: string) => void;
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
      if (deltaX < 0) {
        setSwipeProgress(Math.min(Math.abs(deltaX), 100));
      } else {
        setSwipeProgress(0);
      }
    },
    onSwipedLeft: () => {
      if (swipeProgress >= 100) {
        onOpenDeleteModal(plan);
      }
      setSwipeProgress(0);
    },
    onSwiped: () => {
      setSwipeProgress(0);
    },
    trackMouse: true,
  });

  const transform = `translateX(-${swipeProgress}px)`;
  const deleteOpacity = swipeProgress / 100; // Opacity scales from 0 to 1 as swipe progresses

  return (
    <li className="relative overflow-hidden rounded-xl shadow-md border border-whoop-cyan/20">
      <div
        className="absolute inset-0 flex items-center justify-end pr-4 bg-red-600 transition-opacity duration-100"
        style={{ opacity: deleteOpacity }} // Red background fades in with swipe
      >
        <FaTrash className="w-6 h-6 text-whoop-white" />
      </div>
      <div
        {...swipeHandlers}
        className="flex justify-between items-center bg-whoop-dark p-4 transition-transform duration-100 relative z-10"
        style={{ transform }}
      >
        <span className="text-whoop-white font-semibold">{plan.name}</span>
        <button
          onClick={() => onStart(plan.id)}
          className="px-4 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200 disabled:bg-whoop-gray disabled:scale-100 disabled:shadow-none"
          disabled={isStartingWorkout}
        >
          {isStartingWorkout ? "Starting..." : "Start"}
        </button>
      </div>
    </li>
  );
};

export default PlanItem;
