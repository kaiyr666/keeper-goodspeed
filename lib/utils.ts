import { prisma } from './prisma';

// Safe referenceId generation with retry guard against race conditions
export async function generateReferenceId(propertyId: string): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await prisma.assetBatch.count({ where: { propertyId } });
    const candidate = `KPR-${year}-${String(count + 1).padStart(4, '0')}`;
    const exists = await prisma.assetBatch.findUnique({ where: { referenceId: candidate } });
    if (!exists) return candidate;
    await new Promise(r => setTimeout(r, 50));
  }
  return `KPR-${year}-${Date.now().toString().slice(-4)}`;
}

export function formatCurrency(value: number | null | undefined, currency = 'GBP'): string {
  if (value === null || value === undefined) return 'Pending valuation';
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(value);
}
