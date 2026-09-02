import React from 'react';

export function ErrorComponent({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-3">
      <p className="text-sm text-red-300">⚠️ {message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/40 text-red-200 border border-red-500/40 text-xs font-semibold"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
