'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/upload/StepIndicator';
import { StepCategory }  from '@/components/upload/StepCategory';
import { StepCondition } from '@/components/upload/StepCondition';
import { StepLocation }  from '@/components/upload/StepLocation';
import { StepPhotos }    from '@/components/upload/StepPhotos';
import { StepReview }    from '@/components/upload/StepReview';
import type { UploadFormState } from '@/types';

const INITIAL_STATE: UploadFormState = {
  step: 1, category: '', assetType: '', quantity: '', condition: '',
  yearOfPurchase: '', locationWithinProperty: '', notes: '',
  photos: [], photoPreviewUrls: [],
  isSubmitting: false, submitError: null,
  submitted: false, submittedReferenceId: null, submittedBatchId: null,
};

const DRAFT_KEY = 'keeper_upload_draft';

export default function UploadPage() {
  const { data: session, status } = useSession({ required: true });
  const router = useRouter();
  const [state, setState] = useState<UploadFormState>(INITIAL_STATE);
  const [draftToResume, setDraftToResume] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const update = useCallback((patch: Partial<UploadFormState>) => {
    setState(s => ({ ...s, ...patch }));
  }, []);

  // On mount: check for saved draft
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      const ageHours = (Date.now() - new Date(draft.savedAt).getTime()) / 3600000;
      if (ageHours < 48) setDraftToResume(draft);
    } catch {}
  }, []);

  // Auto-save on every state change (exclude File objects — not serialisable)
  useEffect(() => {
    if (state.submitted) { localStorage.removeItem(DRAFT_KEY); return; }
    const { photos, photoPreviewUrls, isSubmitting, submitError, ...saveable } = state;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...saveable, savedAt: new Date().toISOString() }));
  }, [state]);

  const resumeDraft = () => {
    setState(s => ({ ...s, ...draftToResume, photos: [], photoPreviewUrls: [] }));
    setDraftToResume(null);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftToResume(null);
  };

  const goNext = () => update({ step: (state.step < 5 ? state.step + 1 : 5) as any });
  const goBack = () => update({ step: (state.step > 1 ? state.step - 1 : 1) as any });
  const goToStep = (s: 1 | 2 | 3 | 4) => update({ step: s });

  const handleSubmit = () => {
    update({ isSubmitting: true, submitError: null });
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('category',  state.category);
    formData.append('assetType', state.assetType);
    formData.append('quantity',  String(state.quantity));
    formData.append('condition', state.condition);
    if (state.yearOfPurchase)           formData.append('yearOfPurchase',         String(state.yearOfPurchase));
    if (state.locationWithinProperty)   formData.append('locationWithinProperty', state.locationWithinProperty);
    if (state.notes)                    formData.append('notes',                  state.notes);
    state.photos.forEach(f => formData.append('photos', f));

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        const { batchId, referenceId } = JSON.parse(xhr.responseText);
        localStorage.removeItem(DRAFT_KEY);
        update({ isSubmitting: false, submitted: true, submittedReferenceId: referenceId, submittedBatchId: batchId });
      } else {
        const body = JSON.parse(xhr.responseText || '{}');
        update({ isSubmitting: false, submitError: body.error ?? 'Submission failed. Please try again.' });
      }
    });
    xhr.addEventListener('error', () => {
      update({ isSubmitting: false, submitError: 'Network error. Please try again.' });
    });
    xhr.open('POST', '/api/assets');
    xhr.send(formData);
  };

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-keeper-navy border-t-transparent rounded-full" />
    </div>
  );

  const propertyName = (session?.user as any)?.propertyName ?? '';
  const department   = (session?.user as any)?.department   ?? '';

  // Confirmation screen
  if (state.submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h2 className="text-2xl font-bold text-keeper-navy mb-2">Submitted successfully!</h2>
          <div className="inline-block bg-keeper-blueLight text-keeper-navy font-mono font-semibold px-4 py-2 rounded-xl mb-2">
            {state.submittedReferenceId}
          </div>
          <p className="text-gray-600 mb-6">
            {state.quantity}× {state.assetType} — {state.condition} condition
          </p>

          {/* Mini timeline */}
          <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 mb-6 text-xs text-gray-500">
            <div className="text-center"><div className="font-semibold text-gray-700">1</div>Manager review</div>
            <div className="text-gray-300">→</div>
            <div className="text-center"><div className="font-semibold text-gray-700">2</div>GM approval</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setState(INITIAL_STATE)} className="btn-secondary">
              Upload More Assets
            </button>
            <Link href={`/assets/${state.submittedBatchId}`} className="btn-primary text-center">
              View Submission →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* Draft resume banner */}
        {draftToResume && state.step === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium mb-2">
              You have an unfinished submission —{' '}
              {draftToResume.quantity}× {draftToResume.assetType}, {draftToResume.condition} condition.
            </p>
            <div className="flex gap-2">
              <button onClick={resumeDraft} className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium">
                Continue Draft
              </button>
              <button onClick={discardDraft} className="flex-1 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium">
                Start Fresh
              </button>
            </div>
          </div>
        )}

        <StepIndicator currentStep={state.step} />

        <div className="card">
          {state.step === 1 && <StepCategory  state={state} update={update} onNext={goNext} />}
          {state.step === 2 && <StepCondition state={state} update={update} onNext={goNext} onBack={goBack} />}
          {state.step === 3 && <StepLocation  state={state} update={update} onNext={goNext} onBack={goBack} propertyName={propertyName} department={department} />}
          {state.step === 4 && <StepPhotos    state={state} update={update} onNext={goNext} onBack={goBack} />}
          {state.step === 5 && (
            <StepReview
              state={state} update={update}
              onBack={goBack} onSubmit={handleSubmit}
              goToStep={goToStep}
              propertyName={propertyName}
              department={department}
              uploadProgress={uploadProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
}
