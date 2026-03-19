'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1A3C5E', '#2A7FBF', '#D6E9F5', '#10b981', '#f59e0b', '#ef4444'];

interface Props {
  batches: any[];
}

export function CategoryChart({ batches }: Props) {
  // Count by category
  const counts: Record<string, number> = {};
  batches.forEach(b => {
    counts[b.category] = (counts[b.category] ?? 0) + 1;
  });
  const data = Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0) + name.slice(1).toLowerCase(),
    value,
  }));

  if (!data.length) return null;

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-700 mb-3">By Category</h2>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
