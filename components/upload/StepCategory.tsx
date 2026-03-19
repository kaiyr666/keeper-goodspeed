'use client';
import { CATEGORY_TYPES } from '@/lib/constants';
import type { UploadFormState } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  FURNITURE: '🛋️', LINEN: '🛏️', ELECTRONICS: '📺',
  KITCHEN: '🍽️', FIXTURES: '🪟', OTHER: '📦',
};

interface Props {
  state: UploadFormState;
  update: (patch: Partial<UploadFormState>) => void;
  onNext: () => void;
}

export function StepCategory({ state, update, onNext }: Props) {
  const types = state.category ? CATEGORY_TYPES[state.category] ?? [] : [];
  const canNext = state.category && state.assetType && state.quantity !== '' && Number(state.quantity) >= 1;

  return (
    <div>
      <h2 className="text-xl font-bold text-keeper-navy mb-4">What are you uploading?</h2>

      {/* Category grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {Object.keys(CATEGORY_TYPES).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => update({ category: cat, assetType: '' })}
            className={`p-4 rounded-xl border-2 text-left transition-colors
              ${state.category === cat
                ? 'border-keeper-navy bg-keeper-blueLight'
                : 'border-gray-200 hover:border-keeper-blue'}`}
          >
            <div className="text-2xl mb-1">{CATEGORY_ICONS[cat]}</div>
            <div className="text-sm font-medium text-gray-700 capitalize">{cat.toLowerCase().replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {/* Asset type chips */}
      {state.category && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset type</label>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => update({ assetType: t })}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors
                  ${state.assetType === t
                    ? 'border-keeper-navy bg-keeper-navy text-white'
                    : 'border-gray-300 hover:border-keeper-blue'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity stepper */}
      {state.category && state.assetType && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update({ quantity: Math.max(1, Number(state.quantity || 1) - 1) })}
              className="w-10 h-10 rounded-xl border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:border-keeper-blue"
            >−</button>
            <input
              type="number"
              min={1}
              max={999}
              className="input-field text-center w-24"
              value={state.quantity}
              onChange={e => update({ quantity: e.target.value === '' ? '' : Math.max(1, Math.min(999, parseInt(e.target.value) || 1)) })}
            />
            <button
              type="button"
              onClick={() => update({ quantity: Math.min(999, Number(state.quantity || 0) + 1) })}
              className="w-10 h-10 rounded-xl border-2 border-gray-300 flex items-center justify-center text-lg font-bold hover:border-keeper-blue"
            >+</button>
          </div>
        </div>
      )}

      <button onClick={onNext} disabled={!canNext} className="btn-primary">
        Continue
      </button>
    </div>
  );
}
