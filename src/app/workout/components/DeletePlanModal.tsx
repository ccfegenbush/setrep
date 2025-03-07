/* eslint-disable react/no-unescaped-entities */

type Plan = {
  id: string;
  name: string;
};

type DeletePlanModalProps = {
  isOpen: boolean;
  planToDelete: Plan | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeletePlanModal({
  isOpen,
  planToDelete,
  onClose,
  onConfirm,
}: DeletePlanModalProps) {
  if (!isOpen || !planToDelete) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 transition-opacity duration-300">
      <div className="bg-whoop-card rounded-lg p-6 sm:p-8 shadow-xl shadow-whoop-cyan/20 max-w-md w-full border border-whoop-cyan/40 transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold text-whoop-white mb-4">
          Delete Workout Plan
        </h3>
        <p className="text-whoop-gray/80 mb-6 text-sm sm:text-base">
          Are you sure you want to delete the workout plan "{planToDelete.name}
          "?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-lg hover:scale-105 hover:shadow-whoop-cyan/30 transition-all duration-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white font-semibold rounded-lg hover:scale-105 hover:shadow-red-500/30 transition-all duration-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
