import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'GM')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const pid = session.user.propertyId;
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [byStatus, recoveryStats, esgStats, monthlyRecovery, recentBatches, awaitingApproval] =
    await Promise.all([

      prisma.assetBatch.groupBy({
        by: ['status'], where: { propertyId: pid, isDeleted: false }, _count: true,
      }),

      prisma.assetBatch.aggregate({
        where: { propertyId: pid, isDeleted: false },
        _sum: { estimatedRecoveryValue: true },
      }),

      prisma.assetBatch.aggregate({
        where: { propertyId: pid, isDeleted: false, status: 'COMPLETED', outcomeType: { not: 'WRITTEN_OFF' } },
        _sum: { co2Kg: true, weightKg: true },
      }),

      prisma.assetBatch.aggregate({
        where: { propertyId: pid, isDeleted: false, status: 'COMPLETED', completedAt: { gte: monthStart } },
        _sum: { actualRecoveryValue: true },
      }),

      prisma.assetBatch.findMany({
        where: { propertyId: pid, isDeleted: false },
        orderBy: { submittedAt: 'desc' }, take: 10,
        include: {
          submittedBy: { select: { fullName: true, department: true } },
          photos: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      }),

      prisma.assetBatch.findMany({
        where: { propertyId: pid, isDeleted: false, status: 'PENDING_GM_APPROVAL' },
        orderBy: { submittedAt: 'asc' },
        include: {
          submittedBy: { select: { fullName: true, department: true } },
          photos: { take: 1, orderBy: { sortOrder: 'asc' } },
        },
      }),
    ]);

  const count = (s: string) => byStatus.find(r => r.status === s)?._count ?? 0;

  return NextResponse.json({
    kpis: {
      totalActive:                  count('PENDING_DEPT_APPROVAL') + count('PENDING_GM_APPROVAL') + count('APPROVED') + count('LISTED'),
      pendingApproval:              count('PENDING_DEPT_APPROVAL'),
      pendingGmApproval:            count('PENDING_GM_APPROVAL'),
      approved:                     count('APPROVED'),
      listed:                       count('LISTED'),
      estimatedRecoveryValue:       Number(recoveryStats._sum.estimatedRecoveryValue ?? 0),
      actualRecoveryValueThisMonth: Number(monthlyRecovery._sum.actualRecoveryValue ?? 0),
      co2KgDiverted:                Number(esgStats._sum.co2Kg ?? 0),
      weightKgDiverted:             Number(esgStats._sum.weightKg ?? 0),
    },
    recentBatches,
    awaitingApproval,
  });
}
