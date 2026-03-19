'use client';
import { DEPARTMENT_LABELS, CONDITION_OPTIONS } from '@/lib/constants';
import type { UploadFormState } from '@/types';

interface Props {
  state: UploadFormState;
  update: (patch: Partial<UploadFormState>) => void;
  onBack: () => void;
  onSubmit: () => void;
  goToStep: (step: 1 | 2 | 3 | 4) => void;
  propertyName: string;
  department: string;
  uploadProgress: number;
}

export function StepReview({ state, update, onBack, onSubmit, goToStep, propertyName, department, uploadProgress }: Props) {
  const cond = CONDITION_OPTIONS.find(o => o.code === state.condition);
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div>
      <h2 className="text-xl font-bold text-keeper-navy mb-4">Review & Submit</h2>

      {isOffline && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
          You appear to be offline. Please reconnect before submitting.
        </div>
      )}

      <div className="space-y-3 mb-6">
        {/* Category + Type + Quantity */}
        <div className="card flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Asset</p>
            <p className="font-semibold text-gray-800">
              {state.quantity}× {state.assetType}
              <span className="text-sm text-gray-500 ml-2">({state.category.toLowerCase()})</span>
            </p>
          </div>
          <button onClick={() => goToStep(1)} className="text-sm text-keeper-blue hover:underline py-2 px-1 min-h-[44px] flex items-center">Edit</button>
        </div>

        {/* Condition */}
        <div className="card flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Condition</p>
            <p className={`font-semibold ${cond?.text ?? 'text-gray-800'}`}>
              {state.condition} — {cond?.label}
            </p>
            {state.yearOfPurchase && (
              <p className="text-sm text-gray-500">Purchased: {state.yearOfPurchase}</p>
            )}
          </div>
          <button onClick={() => goToStep(2)} className="text-xs text-keeper-blue hover:underline">Edit</button>
        </div>

        {/* Location */}
        <div className="card flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
            <p className="font-medium text-gray-800">{propertyName}</p>
            <p className="text-sm text-gray-500">{DEPARTMENT_LABELS[department] ?? department}</p>
            {state.locationWithinProperty && (
              <p className="text-sm text-gray-500">{state.locationWithinProperty}</p>
            )}
            {state.notes && (
              <p className="text-sm text-gray-400 mt-1 italic">"{state.notes}"</p>
            )}
          </div>
          <button onClick={() => goToStep(3)} className="text-xs text-keeper-blue hover:underline">Edit</button>
        </div>

        {/* Photos */}
        <div className="card flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Photos</p>
            <div className="flex gap-2 flex-wrap">
              {state.photoPreviewUrls.map((url, i) => (
                <img key={i} src={url} className="w-14 h-14 object-cover rounded-lg" alt={`Photo ${i + 1}`} />
              ))}
            </div>
          </div>
          <button onClick={() => goToStep(4)} className="text-xs text-keeper-blue hover:underline ml-3">Edit</button>
        </div>
      </div>

      {state.submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
          {state.submitError}
        </div>
      )}

      {state.isSubmitting && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{uploadProgress < 100 ? 'Uploading photos…' : 'Processing…'}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-keeper-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress < 100 ? uploadProgress : 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary" disabled={state.isSubmitting}>Back</button>
        <button onClick={onSubmit} disabled={state.isSubmitting || isOffline} className="btn-primary flex items-center justify-center gap-2">
          {state.isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {uploadProgress < 100 ? `${uploadProgress}%` : 'Processing…'}
            </>
          ) : 'Submit Assets'}
        </button>
      </div>
    </div>
  );
}
