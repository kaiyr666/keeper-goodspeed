'use client';
import { CONDITION_OPTIONS } from '@/lib/constants';
import type { UploadFormState, ConditionCode } from '@/types';

interface Props {
  state: UploadFormState;
  update: (patch: Partial<UploadFormState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCondition({ state, update, onNext, onBack }: Props) {
  const canNext = !!state.condition;
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <h2 className="text-xl font-bold text-keeper-navy mb-4">What condition?</h2>

      <div className="space-y-3 mb-5">
        {CONDITION_OPTIONS.map(opt => (
          <button
            key={opt.code}
            type="button"
            onClick={() => update({ condition: opt.code as ConditionCode })}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all
              ${state.condition === opt.code
                ? `${opt.border} ${opt.bg}`
                : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${opt.color}`} />
              <div>
                <div className={`font-semibold ${state.condition === opt.code ? opt.text : 'text-gray-800'}`}>
                  {opt.code} — {opt.label}
                </div>
                <div className="text-sm text-gray-500">{opt.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Optional year picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year of purchase <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="number"
          min={1900}
          max={currentYear}
          placeholder={String(currentYear)}
          className="input-field w-full sm:w-36"
          value={state.yearOfPurchase}
          onChange={e => update({ yearOfPurchase: e.target.value === '' ? '' : parseInt(e.target.value) })}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={onNext} disabled={!canNext} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}
