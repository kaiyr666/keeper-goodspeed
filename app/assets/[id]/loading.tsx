export default function AssetLoading() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
      <div className="h-10 bg-gray-200 rounded w-96 mb-8" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-6">
          <div className="w-4 h-4 bg-gray-200 rounded-full mt-1 shrink-0" />
          <div className="flex-1 h-16 bg-gray-200 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
