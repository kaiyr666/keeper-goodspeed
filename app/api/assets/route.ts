import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReferenceId } from '@/lib/utils';
import { z } from 'zod';
import { sendSubmissionNotification } from '@/lib/email';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const CreateSchema = z.object({
  category:               z.enum(['FURNITURE','LINEN','ELECTRONICS','KITCHEN','FIXTURES','OTHER']),
  assetType:              z.string().min(1).max(100),
  quantity:               z.coerce.number().int().min(1).max(999),
  condition:              z.enum(['A','B','C','D']),
  yearOfPurchase:         z.coerce.number().int().min(1900).max(2030).optional(),
  locationWithinProperty: z.string().max(100).optional(),
  notes:                  z.string().max(300).optional(),
});

// GET — asset list (used by dashboard and My Submissions page)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mine  = searchParams.get('mine') === 'true';
  const page  = parseInt(searchParams.get('page')  ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const where = {
    propertyId: session.user.propertyId,
    isDeleted: false,
    ...(mine ? { submittedById: session.user.id } : {}),
  };

  const [batches, total] = await Promise.all([
    prisma.assetBatch.findMany({
      where, orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
      include: {
        submittedBy: { select: { fullName: true, department: true } },
        photos: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    }),
    prisma.assetBatch.count({ where }),
  ]);

  return NextResponse.json({ batches, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

// POST — create new asset batch
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const formData = await request.formData();

  const parsed = CreateSchema.safeParse({
    category:               formData.get('category'),
    assetType:              formData.get('assetType'),
    quantity:               formData.get('quantity'),
    condition:              formData.get('condition'),
    yearOfPurchase:         formData.get('yearOfPurchase')         || undefined,
    locationWithinProperty: formData.get('locationWithinProperty') || undefined,
    notes:                  formData.get('notes')                  || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const photoFiles = formData.getAll('photos') as File[];
  if (!photoFiles.length || photoFiles[0].size === 0)
    return NextResponse.json({ error: 'At least one photo required' }, { status: 400 });
  if (photoFiles.length > 20)
    return NextResponse.json({ error: 'Maximum 20 photos' }, { status: 400 });

  // Save photos — local dev uses public/uploads/, production uses Vercel Blob
  const dir = path.join(process.cwd(), 'public', 'uploads');
  if (!process.env.BLOB_READ_WRITE_TOKEN) await mkdir(dir, { recursive: true });

  const photoUrls = await Promise.all(photoFiles.map(async (file, i) => {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(`${session.user.propertyId}/${Date.now()}-${i}-${file.name}`, file, { access: 'public' });
      return blob.url;
    } else {
      const fname = `${Date.now()}-${i}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await writeFile(path.join(dir, fname), Buffer.from(await file.arrayBuffer()));
      return `/uploads/${fname}`;
    }
  }));

  const referenceId = await generateReferenceId(session.user.propertyId);

  const batch = await prisma.$transaction(async (tx) => {
    const b = await tx.assetBatch.create({
      data: {
        referenceId, propertyId: session.user.propertyId,
        submittedById: session.user.id,
        department: session.user.department,
        ...parsed.data,
        status: 'PENDING_DEPT_APPROVAL' as any,
      }
    });
    await tx.asset.createMany({
      data: Array.from({ length: parsed.data.quantity }, (_, i) => ({
        batchId: b.id, assetNumber: i + 1,
        referenceId: `${referenceId}-${String(i + 1).padStart(3, '0')}`,
      })),
    });
    await tx.assetPhoto.createMany({
      data: photoUrls.map((url, i) => ({ batchId: b.id, storageUrl: url, sortOrder: i })),
    });
    await tx.journeyEvent.create({ data: {
      batchId: b.id, eventType: 'SUBMITTED' as any,
      performedById: session.user.id,
      newStatus: 'PENDING_DEPT_APPROVAL' as any,
    }});
    return b;
  });

  // Fire-and-forget notification to GM
  const gm = await prisma.user.findFirst({ where: { propertyId: session.user.propertyId, role: 'GM' } });
  if (gm) {
    sendSubmissionNotification(gm.email, gm.fullName, {
      id: batch.id, referenceId: batch.referenceId, assetType: batch.assetType,
      quantity: batch.quantity, condition: batch.condition, department: batch.department,
      submitterName: session.user.name ?? 'Staff member',
    }).catch(console.error);
  }

  return NextResponse.json({ batchId: batch.id, referenceId: batch.referenceId, status: batch.status }, { status: 201 });
}
