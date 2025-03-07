/* eslint-disable react/no-unescaped-entities */
import { FaTrash } from "react-icons/fa";

type DeleteModalProps = {
  isOpen: boolean;
  itemType: "workout" | "exercise" | "plan";
  itemName: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteModal({
  isOpen,
  itemType,
  itemName,
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-whoop-dark/70 flex items-center justify-center z-50">
      <div className="bg-whoop-card rounded-xl p-6 shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold text-whoop-white mb-4">
          Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </h2>
        <p className="text-whoop-gray/80 mb-6">
          Are you sure you want to delete "{itemName}"? This action cannot be
          undone.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-whoop-gray to-whoop-dark text-whoop-white font-semibold rounded-xl hover:bg-gradient-to-r hover:from-whoop-gray/80 hover:to-whoop-dark/80 transition-all duration-200 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 text-whoop-white font-semibold rounded-xl hover:bg-gradient-to-r hover:from-red-500 hover:to-red-700 transition-all duration-200 shadow-sm flex items-center justify-center space-x-2"
          >
            <FaTrash className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
