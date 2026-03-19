import { formatCurrency } from '@/lib/utils';

interface KpiTileProps {
  title: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: string;
}

export function KpiTile({ title, value, sub, icon, color = 'text-keeper-navy' }: KpiTileProps) {
  return (
    <div className="card flex flex-col gap-1">
      <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
        {icon && <span>{icon}</span>}
        {title}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  );
}
