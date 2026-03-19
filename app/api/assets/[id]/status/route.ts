import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendGmApprovalNotification, sendApprovalConfirmation, sendRejectionNotification } from '@/lib/email';

const StatusSchema = z.object({
  action:  z.enum(['approve', 'reject']),
  comment: z.string().optional(),
}).refine(d => {
  if (d.action === 'reject') return (d.comment?.length ?? 0) >= 10;
  return true;
}, { message: 'Rejection reason must be at least 10 characters', path: ['comment'] });

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'GM')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = StatusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const batch = await prisma.assetBatch.findUnique({
    where: { id: params.id }, include: { submittedBy: true }
  });
  if (!batch) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const approvable = ['PENDING_DEPT_APPROVAL', 'PENDING_GM_APPROVAL'];
  if (!approvable.includes(batch.status))
    return NextResponse.json({ error: 'Not in an approvable state', currentStatus: batch.status }, { status: 409 });

  const newStatus = parsed.data.action === 'approve'
    ? (batch.status === 'PENDING_DEPT_APPROVAL' ? 'PENDING_GM_APPROVAL' : 'APPROVED')
    : 'REJECTED';

  const eventType = parsed.data.action === 'reject' ? 'REJECTED'
    : batch.status === 'PENDING_DEPT_APPROVAL' ? 'APPROVED_DEPT' : 'APPROVED_GM';

  const updated = await prisma.$transaction(async (tx) => {
    const b = await tx.assetBatch.update({ where: { id: params.id }, data: { status: newStatus as any } });
    await tx.journeyEvent.create({ data: {
      batchId: params.id, eventType: eventType as any,
      performedById: session.user.id,
      previousStatus: batch.status as any, newStatus: newStatus as any,
      comment: parsed.data.comment ?? null,
    }});
    return b;
  });

  const summary = {
    id: batch.id, referenceId: batch.referenceId, assetType: batch.assetType,
    quantity: batch.quantity, condition: batch.condition, department: batch.department,
    submitterName: batch.submittedBy.fullName,
  };

  if (newStatus === 'PENDING_GM_APPROVAL') {
    const gm = await prisma.user.findFirst({ where: { propertyId: batch.propertyId, role: 'GM' } });
    if (gm) sendGmApprovalNotification(gm.email, gm.fullName, summary, session.user.name ?? 'Manager').catch(console.error);
  } else if (newStatus === 'APPROVED') {
    sendApprovalConfirmation(batch.submittedBy.email, batch.submittedBy.fullName, summary).catch(console.error);
  } else if (newStatus === 'REJECTED') {
    sendRejectionNotification(batch.submittedBy.email, batch.submittedBy.fullName, summary, parsed.data.comment ?? 'No reason provided').catch(console.error);
  }

  return NextResponse.json({ batchId: updated.id, previousStatus: batch.status, newStatus: updated.status, referenceId: updated.referenceId });
}
