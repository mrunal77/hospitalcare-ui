import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  isLoading: boolean;
}

export default function GlobalLoading({ isLoading }: GlobalLoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
