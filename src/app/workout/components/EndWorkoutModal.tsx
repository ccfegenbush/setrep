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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 transition-opacity duration-300">
      <div className="bg-whoop-card rounded-lg p-6 sm:p-8 shadow-xl shadow-whoop-cyan/20 max-w-md w-full border border-whoop-cyan/40 transition-all duration-300">
        <h3 className="text-xl sm:text-2xl font-bold text-whoop-white mb-6">
          Save This Workout?
        </h3>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => onConfirm(false)}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-lg hover:scale-105 hover:shadow-whoop-cyan/30 transition-all duration-200"
          >
            No
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-lg hover:scale-105 hover:shadow-whoop-green/30 transition-all duration-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
