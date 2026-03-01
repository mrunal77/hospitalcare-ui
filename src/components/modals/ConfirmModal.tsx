interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  danger?: boolean;
}

export default function ConfirmModal({ title, message, onConfirm, onClose, isLoading, danger }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-white rounded-xl disabled:opacity-50 font-medium shadow-lg transition-all duration-200 ${
              danger 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25'
            }`}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
