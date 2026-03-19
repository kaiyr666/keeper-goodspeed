'use client';
import { DEPARTMENT_LABELS } from '@/lib/constants';
import type { UploadFormState } from '@/types';

interface Props {
  state: UploadFormState;
  update: (patch: Partial<UploadFormState>) => void;
  onNext: () => void;
  onBack: () => void;
  propertyName: string;
  department: string;
}

export function StepLocation({ state, update, onNext, onBack, propertyName, department }: Props) {
  return (
    <div>
      <h2 className="text-xl font-bold text-keeper-navy mb-4">Where are they?</h2>

      {/* Locked fields */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
          <div className="input-field bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {propertyName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <div className="input-field bg-gray-50 text-gray-500 flex items-center gap-2 cursor-not-allowed">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {DEPARTMENT_LABELS[department] ?? department}
          </div>
        </div>
      </div>

      {/* Optional location */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location within property <span className="text-gray-400">(optional, max 100 chars)</span>
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g. Floor 3 linen store, Restaurant A storage"
          maxLength={100}
          value={state.locationWithinProperty}
          onChange={e => update({ locationWithinProperty: e.target.value })}
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional, max 300 chars)</span>
        </label>
        <textarea
          className="input-field resize-none"
          rows={3}
          maxLength={300}
          placeholder="Any additional details about the assets…"
          value={state.notes}
          onChange={e => update({ notes: e.target.value })}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{state.notes.length}/300</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary">Back</button>
        <button onClick={onNext} className="btn-primary">Continue</button>
      </div>
    </div>
  );
}
