interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = 'Processing...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center gap-4 max-w-sm">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="text-center">
          <p className="text-gray-900 font-semibold text-lg">{message}</p>
          <p className="text-gray-600 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    </div>
  );
}

