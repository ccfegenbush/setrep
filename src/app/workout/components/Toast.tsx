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
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-out">
        {message}
      </div>
    </div>
  );
}
