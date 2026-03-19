// prisma/seed.ts
import {
  PrismaClient, Role, Department, AssetCategory,
  AssetCondition, BatchStatus, EventType, OutcomeType
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const hash = (p: string) => bcrypt.hashSync(p, 12);

async function main() {

  // 1. PROPERTY
  await prisma.property.create({ data: {
    id: 'prop-001',
    name: 'The Grand Hotel London',
    groupName: 'Meridian Hospitality Group',
    timezone: 'Europe/London',
    country: 'UK',
    currency: 'GBP',
  }});

  // 2. USERS
  await prisma.user.create({ data: {
    id: 'user-gm-001', email: 'james.wilson@grandhotel.com',
    passwordHash: hash('keeper123'), fullName: 'James Wilson',
    role: Role.GM, department: Department.GENERAL, propertyId: 'prop-001',
  }});
  await prisma.user.create({ data: {
    id: 'user-dept-001', email: 'sarah.chen@grandhotel.com',
    passwordHash: hash('keeper123'), fullName: 'Sarah Chen',
    role: Role.DEPT_USER, department: Department.ROOMS, propertyId: 'prop-001',
  }});
  await prisma.user.create({ data: {
    id: 'user-dept-002', email: 'marcus.jones@grandhotel.com',
    passwordHash: hash('keeper123'), fullName: 'Marcus Jones',
    role: Role.DEPT_USER, department: Department.FNB, propertyId: 'prop-001',
  }});
  await prisma.user.create({ data: {
    id: 'user-dept-003', email: 'priya.sharma@grandhotel.com',
    passwordHash: hash('keeper123'), fullName: 'Priya Sharma',
    role: Role.DEPT_USER, department: Department.SPA, propertyId: 'prop-001',
  }});
  await prisma.user.create({ data: {
    id: 'user-dept-004', email: 'tom.baker@grandhotel.com',
    passwordHash: hash('keeper123'), fullName: 'Tom Baker',
    role: Role.DEPT_USER, department: Department.BACK_OF_HOUSE, propertyId: 'prop-001',
  }});

  // 3. BATCH HELPER
  const now = new Date();
  const ago = (n: number) => new Date(now.getTime() - n * 86400000);

  async function createBatch(data: any, events: any[]) {
    const b = await prisma.assetBatch.create({ data });
    for (let i = 1; i <= data.quantity; i++) {
      await prisma.asset.create({ data: {
        batchId: b.id, assetNumber: i,
        referenceId: `${data.referenceId}-${String(i).padStart(3, '0')}`,
      }});
    }
    for (const ev of events) {
      await prisma.journeyEvent.create({ data: { batchId: b.id, ...ev } });
    }
    return b;
  }

  // 4. BATCHES

  // COMPLETED: sold dining chairs
  await createBatch({
    id: 'batch-001', referenceId: 'KPR-2024-0001',
    propertyId: 'prop-001', submittedById: 'user-dept-002',
    department: Department.FNB, category: AssetCategory.FURNITURE,
    assetType: 'Dining Chair', quantity: 24, condition: AssetCondition.C,
    yearOfPurchase: 2019, estimatedRecoveryValue: 480, actualRecoveryValue: 552,
    weightKg: 192, co2Kg: 480, status: BatchStatus.COMPLETED,
    outcomeType: OutcomeType.SOLD,
    locationWithinProperty: 'Restaurant A — storage room B2',
    submittedAt: ago(21), completedAt: ago(7),
  }, [
    { eventType: EventType.SUBMITTED,    performedById: 'user-dept-002', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(21) },
    { eventType: EventType.APPROVED_DEPT, performedById: 'user-gm-001', newStatus: BatchStatus.PENDING_GM_APPROVAL,  createdAt: ago(19) },
    { eventType: EventType.APPROVED_GM,  performedById: 'user-gm-001', newStatus: BatchStatus.APPROVED,             createdAt: ago(18) },
    { eventType: EventType.LISTED,                                       newStatus: BatchStatus.LISTED,              createdAt: ago(15) },
    { eventType: EventType.COMPLETED,                                    newStatus: BatchStatus.COMPLETED,
      comment: 'Sold to Furnishing Forward CIC. Recovery: £552.', createdAt: ago(7) },
  ]);

  // COMPLETED: donated linen
  await createBatch({
    id: 'batch-002', referenceId: 'KPR-2024-0002',
    propertyId: 'prop-001', submittedById: 'user-dept-001',
    department: Department.ROOMS, category: AssetCategory.LINEN,
    assetType: 'Duvet', quantity: 60, condition: AssetCondition.C,
    estimatedRecoveryValue: 0, actualRecoveryValue: 0,
    weightKg: 150, co2Kg: 465, status: BatchStatus.COMPLETED,
    outcomeType: OutcomeType.DONATED,
    notes: 'Donated to Shelter UK.',
    submittedAt: ago(18), completedAt: ago(10),
  }, [
    { eventType: EventType.SUBMITTED,     performedById: 'user-dept-001', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(18) },
    { eventType: EventType.APPROVED_DEPT, performedById: 'user-gm-001',  newStatus: BatchStatus.PENDING_GM_APPROVAL,  createdAt: ago(17) },
    { eventType: EventType.APPROVED_GM,   performedById: 'user-gm-001',  newStatus: BatchStatus.APPROVED, comment: 'Approved for donation.', createdAt: ago(16) },
    { eventType: EventType.COMPLETED,                                     newStatus: BatchStatus.COMPLETED, createdAt: ago(10) },
  ]);

  // APPROVED: awaiting Keeper Ops
  await createBatch({
    id: 'batch-003', referenceId: 'KPR-2024-0003',
    propertyId: 'prop-001', submittedById: 'user-dept-001',
    department: Department.ROOMS, category: AssetCategory.FURNITURE,
    assetType: 'Bed Frame', quantity: 8, condition: AssetCondition.B,
    yearOfPurchase: 2020, estimatedRecoveryValue: 640,
    weightKg: 320, co2Kg: 800, status: BatchStatus.APPROVED,
    locationWithinProperty: 'Floor 4 storage', submittedAt: ago(9),
  }, [
    { eventType: EventType.SUBMITTED,     performedById: 'user-dept-001', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(9) },
    { eventType: EventType.APPROVED_DEPT, performedById: 'user-gm-001',  newStatus: BatchStatus.PENDING_GM_APPROVAL,  createdAt: ago(8) },
    { eventType: EventType.APPROVED_GM,   performedById: 'user-gm-001',  newStatus: BatchStatus.APPROVED,             createdAt: ago(7) },
  ]);

  // PENDING_GM_APPROVAL: key demo state — GM approves this from dashboard
  await createBatch({
    id: 'batch-004', referenceId: 'KPR-2024-0004',
    propertyId: 'prop-001', submittedById: 'user-dept-002',
    department: Department.FNB, category: AssetCategory.KITCHEN,
    assetType: 'Crockery', quantity: 120, condition: AssetCondition.C,
    estimatedRecoveryValue: 180, weightKg: 48, co2Kg: 86,
    status: BatchStatus.PENDING_GM_APPROVAL,
    notes: 'Mixed crockery from restaurant refurb.',
    submittedAt: ago(3),
  }, [
    { eventType: EventType.SUBMITTED,     performedById: 'user-dept-002', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(3) },
    { eventType: EventType.APPROVED_DEPT, performedById: 'user-gm-001',  newStatus: BatchStatus.PENDING_GM_APPROVAL, comment: 'Looks good, forwarding to GM.', createdAt: ago(2) },
  ]);

  // PENDING_GM_APPROVAL: second demo asset
  await createBatch({
    id: 'batch-005', referenceId: 'KPR-2024-0005',
    propertyId: 'prop-001', submittedById: 'user-dept-003',
    department: Department.SPA, category: AssetCategory.FURNITURE,
    assetType: 'Sofa', quantity: 3, condition: AssetCondition.B,
    yearOfPurchase: 2021, estimatedRecoveryValue: 750,
    weightKg: 180, co2Kg: 450,
    status: BatchStatus.PENDING_GM_APPROVAL,
    locationWithinProperty: 'Spa reception', submittedAt: ago(2),
  }, [
    { eventType: EventType.SUBMITTED,     performedById: 'user-dept-003', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(2) },
    { eventType: EventType.APPROVED_DEPT, performedById: 'user-gm-001',  newStatus: BatchStatus.PENDING_GM_APPROVAL,  createdAt: ago(1) },
  ]);

  // PENDING_DEPT_APPROVAL: fresh submission
  await createBatch({
    id: 'batch-006', referenceId: 'KPR-2024-0006',
    propertyId: 'prop-001', submittedById: 'user-dept-004',
    department: Department.BACK_OF_HOUSE, category: AssetCategory.ELECTRONICS,
    assetType: 'TV', quantity: 6, condition: AssetCondition.B,
    brand: 'Samsung', estimatedRecoveryValue: 900,
    weightKg: 72, co2Kg: 576,
    status: BatchStatus.PENDING_DEPT_APPROVAL,
    locationWithinProperty: 'Back office store room', submittedAt: ago(1),
  }, [
    { eventType: EventType.SUBMITTED, performedById: 'user-dept-004', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(1) },
  ]);

  // REJECTED: for demonstration
  await createBatch({
    id: 'batch-007', referenceId: 'KPR-2024-0007',
    propertyId: 'prop-001', submittedById: 'user-dept-001',
    department: Department.ROOMS, category: AssetCategory.LINEN,
    assetType: 'Towel', quantity: 200, condition: AssetCondition.D,
    status: BatchStatus.REJECTED, submittedAt: ago(14),
  }, [
    { eventType: EventType.SUBMITTED, performedById: 'user-dept-001', newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(14) },
    { eventType: EventType.REJECTED,  performedById: 'user-gm-001',  newStatus: BatchStatus.REJECTED,
      comment: 'Condition too poor. Please arrange disposal via waste contractor.', createdAt: ago(13) },
  ]);

  // BATCHES 8–15: dashboard richness
  interface Extra {
    ref: string; uid: string; dept: Department; cat: AssetCategory; type: string;
    qty: number; cond: AssetCondition; status: BatchStatus; outcome?: OutcomeType;
    recov?: number; days: number; brand?: string;
  }

  const extras: Extra[] = [
    { ref: 'KPR-2024-0008', uid: 'user-dept-001', dept: Department.ROOMS,         cat: AssetCategory.FURNITURE,   type: 'Wardrobe',       qty: 12,  cond: AssetCondition.C, status: BatchStatus.COMPLETED,            outcome: OutcomeType.SOLD,    recov: 360, days: 30 },
    { ref: 'KPR-2024-0009', uid: 'user-dept-002', dept: Department.FNB,           cat: AssetCategory.FURNITURE,   type: 'Table',          qty: 8,   cond: AssetCondition.B, status: BatchStatus.APPROVED,                             recov: 640, days: 12 },
    { ref: 'KPR-2024-0010', uid: 'user-dept-001', dept: Department.ROOMS,         cat: AssetCategory.LINEN,       type: 'Bedsheet',       qty: 150, cond: AssetCondition.B, status: BatchStatus.COMPLETED,            outcome: OutcomeType.DONATED,             days: 25 },
    { ref: 'KPR-2024-0011', uid: 'user-dept-003', dept: Department.SPA,           cat: AssetCategory.FIXTURES,    type: 'Mirror',         qty: 5,   cond: AssetCondition.B, status: BatchStatus.PENDING_GM_APPROVAL,              recov: 250, days: 4  },
    { ref: 'KPR-2024-0012', uid: 'user-dept-004', dept: Department.BACK_OF_HOUSE, cat: AssetCategory.KITCHEN,     type: 'Trolley',        qty: 4,   cond: AssetCondition.C, status: BatchStatus.PENDING_DEPT_APPROVAL,                         days: 1  },
    { ref: 'KPR-2024-0013', uid: 'user-dept-002', dept: Department.FNB,           cat: AssetCategory.ELECTRONICS, type: 'Coffee Machine', qty: 3,   cond: AssetCondition.B, status: BatchStatus.APPROVED,             brand: 'Nespresso', recov: 450, days: 6  },
    { ref: 'KPR-2024-0014', uid: 'user-dept-001', dept: Department.ROOMS,         cat: AssetCategory.FURNITURE,   type: 'Headboard',      qty: 16,  cond: AssetCondition.C, status: BatchStatus.COMPLETED,            outcome: OutcomeType.RECYCLED,            days: 35 },
    { ref: 'KPR-2024-0015', uid: 'user-dept-001', dept: Department.ROOMS,         cat: AssetCategory.FURNITURE,   type: 'Desk',           qty: 10,  cond: AssetCondition.B, status: BatchStatus.PENDING_GM_APPROVAL,              recov: 500, days: 5  },
  ];

  for (const e of extras) {
    await createBatch({
      referenceId: e.ref, propertyId: 'prop-001',
      submittedById: e.uid, department: e.dept,
      category: e.cat, assetType: e.type, quantity: e.qty,
      condition: e.cond, brand: e.brand ?? null,
      estimatedRecoveryValue: e.recov ?? null,
      actualRecoveryValue: e.status === BatchStatus.COMPLETED && e.outcome === OutcomeType.SOLD ? e.recov : null,
      status: e.status, outcomeType: e.outcome ?? null,
      submittedAt: ago(e.days),
      completedAt: e.status === BatchStatus.COMPLETED ? ago(Math.floor(e.days / 2)) : null,
    }, [
      { eventType: EventType.SUBMITTED, performedById: e.uid, newStatus: BatchStatus.PENDING_DEPT_APPROVAL, createdAt: ago(e.days) },
    ]);
  }

  console.log('✓ Seed complete: 1 property | 5 users | 15 batches');
}

main().catch(console.error).finally(() => prisma.$disconnect());
