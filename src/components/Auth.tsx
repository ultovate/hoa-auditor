/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Building2, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Info } from 'lucide-react';
import { useTheme } from '../theme';
import { supabase } from '../services/supabase';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
}

const Auth = ({ onAuthSuccess }: AuthProps) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset notifications on mode switch
  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
  }, [viewMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (viewMode === 'login') {
        if (!email || !password) {
          throw new Error('Please fill in all fields.');
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        
        if (data?.session) {
          setSuccessMsg('Authentication successful! Loading dashboard...');
          // Delay briefly to allow the success state animation to show
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 600);
        } else {
          throw new Error('Failed to retrieve session.');
        }
      } else {
        // TODO: Integrate Cloudflare Turnstile CAPTCHA validation here before production launch to prevent token exploitation
        console.log('Upcoming anti-abuse check placeholder');

        if (!name || !email || !password || !confirmPassword) {
          throw new Error('Please fill in all fields.');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (!agreeTerms) {
          throw new Error('You must agree to the Terms of Service.');
        }

        // Check if a profile already exists with this email
        try {
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email)
            .maybeSingle();

          if (profileCheckError) {
            console.warn('Profile check database query returned error:', profileCheckError);
          } else if (existingProfile) {
            throw new Error('An account with this email already exists.');
          }
        } catch (err: any) {
          if (err.message === 'An account with this email already exists.') {
            throw err;
          }
          console.warn('Profile check database query failed:', err);
        }

        // TODO: Integrate CAPTCHA guardrail (e.g., Cloudflare Turnstile) or Supabase MFA 
        // to prevent abusive token usage before the public production launch.
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              organization: orgName || undefined,
            },
          },
        });

        if (signUpError) {
          // Cleanly catch user already exists error and return a friendly validation message
          if (signUpError.message?.toLowerCase().includes('already') || signUpError.status === 422) {
            throw new Error('An account with this email address already exists. Please sign in instead.');
          }
          throw signUpError;
        }

        if (data?.session) {
          setSuccessMsg('Registration successful! Logging you in...');
          setTimeout(() => {
            onAuthSuccess(data.session);
          }, 800);
        } else {
          setSuccessMsg('Account created successfully! Please check your email inbox for a confirmation link.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{ backgroundColor: theme.pageBg }} 
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 canvas-grid relative overflow-hidden"
    >
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#9333EA]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-5000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#9333EA]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        {/* Main Card */}
        <div className="card rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
          
          {/* Card Header in Deep B2B background */}
          <div 
            style={{ backgroundColor: theme.darkHeader }} 
            className="p-8 text-center border-b border-white/10"
          >
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div 
                style={{ backgroundColor: theme.brand }} 
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg transition-transform hover:scale-105"
              >
                U
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">Ultovate</span>
            </div>
            <p className="text-purple-200/70 text-xs font-semibold uppercase tracking-wider">
              HOA Forensic Audit Platform
            </p>
          </div>

          {/* Card Body with Rich Contrast Border */}
          <div 
            style={{ borderColor: theme.border }} 
            className="bg-white p-8 rounded-b-2xl border-x border-b flex flex-col gap-6"
          >
            {/* Header Text */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-800">
                {viewMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {viewMode === 'login' 
                  ? 'Sign in to access your organization audits' 
                  : 'Get started with HOA Forensic Auditor'}
              </p>
            </div>

            {/* Alerts have been moved inside the form above the action button */}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Conditional Name Field for SignUp */}
              {viewMode === 'signup' && (
                <div className="form-control w-full">
                  <label htmlFor="signup-name" className="label py-1">
                    <span className="label-text text-slate-700 font-semibold text-xs">Full Name</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="form-control w-full">
                <label htmlFor="auth-email" className="label py-1">
                  <span className="label-text text-slate-700 font-semibold text-xs">Work Email</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="username"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA] outline-none"
                  />
                </div>
              </div>

              {/* Conditional Organization Field for SignUp */}
              {viewMode === 'signup' && (
                <div className="form-control w-full">
                  <label htmlFor="signup-org" className="label py-1">
                    <span className="label-text text-slate-700 font-semibold text-xs">Organization / HOA Board (Optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="signup-org"
                      type="text"
                      autoComplete="organization"
                      placeholder="Chiavari Owners Association"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="input input-bordered w-full pl-10 bg-slate-50 border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="form-control w-full">
                <label htmlFor="auth-password" className="label py-1 flex items-center justify-between">
                  <span className="label-text text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                    Password
                    {viewMode === 'signup' && (
                      <span 
                        className="tooltip tooltip-right tooltip-primary cursor-help text-[#9333EA]" 
                        data-tip="Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
                      >
                        <Info className="w-3.5 h-3.5 inline-block text-slate-400 hover:text-[#9333EA] transition-colors" />
                      </span>
                    )}
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={viewMode === 'login' ? 'current-password' : 'new-password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-pressed={showPassword}
                    aria-label="Show password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Conditional Password Confirmation Field for SignUp */}
              {viewMode === 'signup' && (
                <div className="form-control w-full">
                  <label htmlFor="signup-confirm" className="label py-1 flex items-center justify-between">
                    <span className="label-text text-slate-700 font-semibold text-xs flex items-center gap-1.5">
                      Confirm Password
                      <span 
                        className="tooltip tooltip-right tooltip-primary cursor-help text-[#9333EA]" 
                        data-tip="Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 symbol"
                      >
                        <Info className="w-3.5 h-3.5 inline-block text-slate-400 hover:text-[#9333EA] transition-colors" />
                      </span>
                    </span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="signup-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input input-bordered w-full pl-10 pr-10 bg-slate-50 border-slate-200 text-slate-800 text-sm focus:bg-white focus:border-[#9333EA] focus:ring-1 focus:ring-[#9333EA] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-pressed={showConfirmPassword}
                      aria-label="Show confirm password"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Keep logged in / Terms & Conditions checkboxes */}
              {viewMode === 'login' ? (
                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="checkbox checkbox-xs border-slate-300 rounded text-[#9333EA] focus:ring-[#9333EA]"
                    />
                    <span className="text-xs text-slate-600">Remember this device</span>
                  </label>
                </div>
              ) : (
                <div className="form-control mt-1">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="checkbox checkbox-xs mt-0.5 border-slate-300 rounded text-[#9333EA] focus:ring-[#9333EA]"
                    />
                    <span className="text-[11px] text-slate-500 leading-normal">
                      I agree to the <a href="#terms" className="text-[#9333EA] hover:underline font-semibold">Terms of Service</a> and <a href="#privacy" className="text-[#9333EA] hover:underline font-semibold">Privacy Policy</a>.
                    </span>
                  </label>
                </div>
              )}

              {/* Error and Success Alerts */}
              {error && (
                <div className="alert alert-error bg-red-50 text-red-700 border-red-200 text-xs py-2 px-3 rounded-lg flex items-center gap-2 mb-2">
                  <span className="font-semibold">Error:</span> {error}
                </div>
              )}
              {successMsg && (
                <div className="alert alert-success bg-emerald-50 text-emerald-700 border-emerald-200 text-xs py-2 px-3 rounded-lg flex items-center gap-2 mb-2">
                  <span className="font-semibold">Success:</span> {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: theme.brand }}
                className="btn text-white w-full rounded-lg py-2 mt-2 font-semibold shadow-lg hover:brightness-110 active:scale-[0.98] border-none transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> 
                    {viewMode === 'login' ? 'Authenticating...' : 'Registering...'}
                  </>
                ) : (
                  <>
                    {viewMode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Footer */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-500">
                {viewMode === 'login' ? (
                  <>
                    New to Ultovate?{' '}
                    <button
                      onClick={() => setViewMode('signup')}
                      className="font-semibold text-[#9333EA] hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setViewMode('login')}
                      className="font-semibold text-[#9333EA] hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="text-center mt-6">
          <p className="text-xs text-purple-200/50">
            &copy; 2026 Ultovate Inc. All rights reserved. • Secure B2B SSO compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
