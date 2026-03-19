import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center p-4">
      <h1 className="text-5xl font-bold text-keeper-navy">404</h1>
      <p className="text-gray-500">This page could not be found.</p>
      <Link href="/" className="text-keeper-blue underline">Go home</Link>
    </div>
  );
}
