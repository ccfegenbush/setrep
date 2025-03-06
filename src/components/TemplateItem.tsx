import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { TrashIcon } from "@heroicons/react/24/solid";

type Template = {
  id: string;
  name: string;
};

type TemplateItemProps = {
  template: Template;
  onStart: (id: string) => void;
  onOpenDeleteModal: (template: Template) => void;
  isStartingWorkout: boolean;
};

const TemplateItem: React.FC<TemplateItemProps> = ({
  template,
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
        onOpenDeleteModal(template);
      }
      setSwipeProgress(0);
    },
    onSwiped: () => {
      setSwipeProgress(0);
    },
    trackMouse: true,
  });

  const transform = `translateX(-${swipeProgress}px)`;

  return (
    <li className="relative overflow-hidden rounded-md shadow-sm">
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-red-600">
        <TrashIcon className="w-6 h-6 text-white" />
      </div>
      <div
        {...swipeHandlers}
        className="flex justify-between items-center bg-gray-50 p-3 transition-transform duration-100"
        style={{ transform }}
      >
        <span className="text-gray-700 font-medium">{template.name}</span>
        <button
          onClick={() => onStart(template.id)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={isStartingWorkout}
        >
          {isStartingWorkout ? "Starting..." : "Start"}
        </button>
      </div>
    </li>
  );
};

export default TemplateItem;
