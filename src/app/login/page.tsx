'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('next') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } else {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        if (data.session) {
            router.push(redirectTo);
            router.refresh();
        } else {
            setMessage('Check your email for the confirmation link.');
            setLoading(false);
        }
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] md:min-h-[60vh] bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 max-w-sm mx-auto w-full">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-2 text-base text-gray-500">
            {isLogin ? 'Enter your details to sign in.' : 'Start your journey with us.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black focus:bg-white transition-all sm:text-sm sm:leading-6"
                placeholder="Full Name"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black focus:bg-white transition-all sm:text-sm sm:leading-6"
              placeholder="Email address"
              required
            />
          </div>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-2xl border-0 bg-gray-50 py-4 pl-12 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black focus:bg-white transition-all sm:text-sm sm:leading-6"
              placeholder="Password"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            </div>
          )}
          
          {message && (
            <div className="rounded-xl bg-green-50 p-4">
              <div className="flex">
                <div className="text-sm text-green-700 font-medium">{message}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-black px-3 py-4 text-base font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center gap-2">
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </span>
            )}
          </button>
        </form>

        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">
                {isLogin ? "New here?" : "Already have an account?"}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="font-semibold text-black hover:text-gray-700 transition-colors"
            >
              {isLogin ? 'Create an account' : 'Sign in to your account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
