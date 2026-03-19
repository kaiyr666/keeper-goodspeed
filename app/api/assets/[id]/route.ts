import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const batch = await prisma.assetBatch.findUnique({
    where: { id: params.id },
    include: {
      submittedBy: { select: { fullName: true, department: true, email: true } },
      photos: { orderBy: { sortOrder: 'asc' } },
      assets: { orderBy: { assetNumber: 'asc' } },
      journeyEvents: {
        orderBy: { createdAt: 'asc' },
        include: { performedBy: { select: { fullName: true, role: true } } },
      },
    },
  });

  if (!batch || batch.propertyId !== session.user.propertyId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(batch);
}
