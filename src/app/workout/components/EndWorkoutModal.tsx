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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-whoop-card rounded-xl p-6 shadow-lg shadow-glow max-w-sm w-full border border-whoop-cyan/30">
        <h3 className="text-xl font-semibold text-whoop-white mb-6">
          Would you like to save this workout?
        </h3>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => onConfirm(false)}
            className="px-4 py-2 bg-gradient-to-r from-whoop-cyan to-whoop-dark text-whoop-white font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
          >
            No
          </button>
          <button
            onClick={() => onConfirm(true)}
            className="px-4 py-2 bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark font-semibold rounded-xl hover:scale-105 hover:shadow-glow transition-transform duration-200"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
