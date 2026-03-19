'use client';

const STEPS = ['Category', 'Condition', 'Location', 'Photos', 'Review'];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < currentStep;
        const active = step === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                ${done   ? 'bg-keeper-blue text-white' :
                  active ? 'bg-keeper-navy text-white' :
                           'bg-gray-200 text-gray-500'}`}>
                {done ? '✓' : step}
              </div>
              <span className={`text-xs mt-1 hidden sm:block ${active ? 'text-keeper-navy font-medium' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${done ? 'bg-keeper-blue' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
