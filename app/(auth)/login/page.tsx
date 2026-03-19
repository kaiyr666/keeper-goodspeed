'use client';
import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';

  // Prefetch both possible destinations so they're ready instantly after login
  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/upload');
  }, [router]);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const result = await signIn('credentials', {
        email, password,
        redirect: false,
        callbackUrl: redirect || undefined,
      });

      setLoading(false);

      if (!result?.ok) {
        setError(true);
        return;
      }

      if (redirect) {
        router.push(redirect);
        return;
      }

      // Single session read — already in-flight from signIn cookie
      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' });
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      router.push(role === 'GM' ? '/dashboard' : '/upload');
    } catch (err) {
      setLoading(false);
      setError(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-keeper-navy mb-4">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-2xl font-bold text-keeper-navy tracking-tight">KEEPER</h1>
          <p className="text-sm text-gray-400 mt-1">Asset Governance Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoFocus
                placeholder="you@hotel.com"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-11"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors w-11 h-11 flex items-center justify-center"
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm text-center">
                Incorrect email or password.
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 !mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Demo hint */}
        <p className="mt-6 text-xs text-gray-400 text-center leading-5">
          Demo — GM: james.wilson@grandhotel.com / keeper123<br />
          Staff: sarah.chen@grandhotel.com / keeper123
        </p>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
