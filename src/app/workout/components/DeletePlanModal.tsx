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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-whoop-card rounded-xl p-6 shadow-lg shadow-glow max-w-sm w-full border border-whoop-cyan/30">
        <h3 className="text-xl font-semibold text-whoop-white mb-4">
          Delete Workout Plan
        </h3>
        <p className="text-whoop-gray mb-6">
          Are you sure you want to delete the workout plan "{planToDelete.name}
          "?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
