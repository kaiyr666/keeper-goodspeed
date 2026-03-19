'use client';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-4">
      <h1 className="text-2xl font-bold text-keeper-navy">Something went wrong</h1>
      <button onClick={reset} className="btn-primary max-w-xs">Try again</button>
    </div>
  );
}
