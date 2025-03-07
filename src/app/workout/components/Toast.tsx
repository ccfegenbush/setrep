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
      <div className="bg-gradient-to-r from-whoop-green to-whoop-cyan text-whoop-dark px-6 py-3 rounded-xl shadow-lg shadow-glow border border-whoop-green/50 animate-fade-in-out font-semibold">
        {message}
      </div>
    </div>
  );
}
