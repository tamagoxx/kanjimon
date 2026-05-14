'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        login({ username: username || 'Guest', email: email || 'guest@example.com' });
        router.push('/');
      } else {
        register({ username, email });
        router.push('/');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    login({ username: 'GuestPlayer', email: 'guest@kanjimon.app' });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
            KanjiMon
          </Link>
          <p className="text-[#636E72] mt-2">Belajar Bahasa Jepang Sambil Bertarung!</p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-[#2D2D44] text-[#B2BEC3] hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                mode === 'register'
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-[#2D2D44] text-[#B2BEC3] hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-[#636E72] mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Your username"
                  required={mode === 'register'}
                  className="w-full px-4 py-3 bg-[#2D2D44] border border-[#3D3D54] rounded-xl text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#636E72] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[#2D2D44] border border-[#3D3D54] rounded-xl text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-sm text-[#636E72] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#2D2D44] border border-[#3D3D54] rounded-xl text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#2D2D44]" />
            <span className="text-[#636E72] text-sm">or</span>
            <div className="flex-1 h-px bg-[#2D2D44]" />
          </div>

          {/* Guest Login */}
          <button
            onClick={handleGuestLogin}
            className="w-full py-3 bg-[#2D2D44] rounded-xl font-medium text-[#B2BEC3] hover:bg-[#3D3D54] hover:text-white transition-colors"
          >
            Continue as Guest
          </button>

          {/* Demo note */}
          <p className="text-center text-xs text-[#636E72] mt-4">
            Demo mode: Just click Login/Register with any email
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-[#636E72] hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}