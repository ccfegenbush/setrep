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
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Delete Workout Plan
        </h3>
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete the workout plan "{planToDelete.name}
          "?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
