import { useEffect } from "react";

type ToastProps = {
  message: string;
  isVisible: boolean;
  onClose: () => void;
};

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-whoop-dark/90 text-whoop-white px-6 py-3 rounded-lg shadow-xl shadow-whoop-green/20 border border-whoop-green/40 font-semibold transition-all duration-300 animate-fade-in-out">
        {message}
      </div>
    </div>
  );
}
