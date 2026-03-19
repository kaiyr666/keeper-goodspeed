export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-2xl mb-4" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
    </div>
  );
}
