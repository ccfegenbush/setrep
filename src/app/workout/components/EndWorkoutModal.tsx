/* eslint-disable @typescript-eslint/no-unused-vars */

type EndWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (shouldSave: boolean) => void;
};

export default function EndWorkoutModal({
  isOpen,
  onClose,
  onConfirm,
}: EndWorkoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Would you like to save this workout?
        </h3>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            No
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
