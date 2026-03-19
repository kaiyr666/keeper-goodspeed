// types/index.ts
import type { AssetBatch, Asset, JourneyEvent, AssetPhoto, User } from '@prisma/client';

// Full batch with all relations — returned by GET /api/assets/[id]
export type BatchWithRelations = AssetBatch & {
  submittedBy: Pick<User, 'fullName' | 'department' | 'email'>;
  photos: AssetPhoto[];
  assets: Asset[];
  journeyEvents: (JourneyEvent & {
    performedBy: Pick<User, 'fullName' | 'role'> | null;
  })[];
};

// Lightweight batch for lists and dashboard tables
export type BatchSummary = AssetBatch & {
  submittedBy: Pick<User, 'fullName' | 'department'>;
  photos: Pick<AssetPhoto, 'storageUrl' | 'sortOrder'>[];
};

// Dashboard API response
export interface DashboardData {
  kpis: {
    totalActive: number;
    pendingApproval: number;
    pendingGmApproval: number;
    approved: number;
    listed: number;
    estimatedRecoveryValue: number;
    actualRecoveryValueThisMonth: number;
    co2KgDiverted: number;
    weightKgDiverted: number;
  };
  recentBatches: BatchSummary[];
  awaitingApproval: BatchSummary[];
}

// Upload form state
export type ConditionCode = 'A' | 'B' | 'C' | 'D';

export interface UploadFormState {
  step: 1 | 2 | 3 | 4 | 5;
  category: string;
  assetType: string;
  quantity: number | '';
  condition: ConditionCode | '';
  yearOfPurchase: number | '';
  locationWithinProperty: string;
  notes: string;
  photos: File[];
  photoPreviewUrls: string[];
  isSubmitting: boolean;
  submitError: string | null;
  submitted: boolean;
  submittedReferenceId: string | null;
  submittedBatchId: string | null;
}

// Passed to every email notification function
export interface NotificationBatch {
  id: string;           // UUID — used in CTA URL
  referenceId: string;  // KPR-XXXX — displayed in email body
  assetType: string;
  quantity: number;
  condition: string;
  department: string;
  submitterName: string;
}
