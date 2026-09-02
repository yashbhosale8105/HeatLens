import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
      <span className="text-5xl">🌡️</span>
      <h2 className="text-2xl font-bold text-slate-100">404 - Page Not Found</h2>
      <p className="text-sm text-slate-400">The requested HeatLens surface module or page does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
