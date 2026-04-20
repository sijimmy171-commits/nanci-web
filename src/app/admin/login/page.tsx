'use client';

import React, { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bmw-black flex items-center justify-center text-white">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrlParam = searchParams.get('callbackUrl') || '/admin';
  const callbackUrl = callbackUrlParam.startsWith('/admin') ? callbackUrlParam : '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (response?.error) {
        setError('登录失败：账号或密码错误。');
      } else {
        router.push(response?.url || callbackUrl);
      }
    } catch {
      setError('发生未知错误，请稍后重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bmw-black flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bmw-blue/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-bmw-red/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-block text-3xl font-black tracking-[0.3em] text-white mb-4">
            SUCI<span className="text-bmw-blue">.</span>
          </div>
          <h1 className="text-sm font-bold text-bmw-silver tracking-[0.2em] uppercase">Admin Management Gateway</h1>
        </div>

        <div className="glass-panel-dark border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-bmw-red/10 border border-bmw-red/20 text-bmw-red text-xs font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-bmw-silver ml-1">Email Identifier</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-bmw-silver group-focus-within:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-bmw-black/50 border border-white/10 p-4 pl-10 text-white focus:outline-none focus:border-bmw-blue transition-all"
                  placeholder="admin@suci.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-bmw-silver ml-1">Access Protocol</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-bmw-silver group-focus-within:text-white transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-bmw-black/50 border border-white/10 p-4 pl-10 text-white focus:outline-none focus:border-bmw-blue transition-all"
                  placeholder="Enter access password"
                />
              </div>
            </div>

            <button disabled={isLoading} type="submit" className="group w-full bg-white text-bmw-black py-4 font-bold text-xs tracking-widest uppercase flex items-center justify-center hover:bg-bmw-lightgray transition-colors disabled:opacity-50">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Initialize Authentication</span>
                  <ArrowRight className="w-4 h-4 ml-4 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-bmw-silver font-medium uppercase tracking-widest">Authorized Personnel Only. All actions are protected server-side.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
