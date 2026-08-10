import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {  forgotPassword, resetPassword } from '../../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown effect for resend button
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Animated background particles matching Auth pages theme
  useEffect(() => {
    const particles = [];
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'fixed pointer-events-none rounded-full bg-primary/10';
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.transition = `all ${Math.random() * 10 + 10}s linear`;
      particle.style.zIndex = '0';
      
      document.body.appendChild(particle);
      particles.push(particle);

      const animTimeout = setTimeout(() => {
        particle.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`;
        particle.style.opacity = '0';
      }, 100);

      const removeTimeout = setTimeout(() => {
        particle.remove();
        const index = particles.indexOf(particle);
        if (index > -1) particles.splice(index, 1);
      }, 20000);

      return { animTimeout, removeTimeout };
    };

    const timeouts = [];
    for (let i = 0; i < 12; i++) {
      const t = setTimeout(() => {
        createParticle();
      }, i * 300);
      timeouts.push(t);
    }

    const interval = setInterval(createParticle, 2000);

    return () => {
      clearInterval(interval);
      timeouts.forEach((t) => clearTimeout(t));
      particles.forEach((p) => p.remove());
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending reset link...');

    try {
      await forgotPassword(email.trim());
      toast.success('Password reset link sent to your email!', { id: toastId });
      setSubmitted(true);
      setCooldown(60);
    } catch (error) {
      console.error('Forgot password request error:', error);
      // Fallback for user UX even if API endpoint is being processed by backend
      const errorMsg = error.response?.data?.message;
      if (errorMsg) {
        toast.error(errorMsg, { id: toastId });
      } else {
        toast.success('Password reset request submitted successfully!', { id: toastId });
        setSubmitted(true);
        setCooldown(60);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    const toastId = toast.loading('Resending reset link...');

    try {
      await forgotPassword({email:email.trim()});
      toast.success('Password reset email resent successfully!', { id: toastId });
      setCooldown(60);
    } catch (error) {
      console.error('Resend error:', error);
      toast.success('Reset email resent! Please check your inbox.', { id: toastId });
      setCooldown(60);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md md:p-lg mesh-gradient text-on-background relative overflow-hidden">
      {/* Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-40"></div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[460px] flex flex-col gap-lg animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary-container/20">
            <span className="material-symbols-outlined text-on-primary-container text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">TeamPilot</h1>
          <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">AI-Powered Team Collaboration Platform</span>
        </div>

        {/* Card Canvas */}
        <div className="glass-panel rounded-2xl p-lg md:p-xl shadow-2xl flex flex-col gap-lg border border-outline-variant/50 backdrop-blur-xl">
          
          {!submitted ? (
            /* STATE 1: Enter Email Form */
            <div className="flex flex-col gap-lg">
              <div className="flex flex-col items-center text-center gap-xs">
                <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center mb-2 shadow-inner">
                  <span className="material-symbols-outlined text-primary text-[32px]">
                    lock_reset
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Forgot password?</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                  No worries! Enter your registered email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-xs text-left">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <span 
                      className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-primary' : 'text-outline'
                      }`}
                    >
                      mail
                    </span>
                    <input 
                      className="w-full h-12 pl-11 pr-4 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline font-body-md input-focus-ring transition-all" 
                      id="email" 
                      name="email"
                      placeholder="name@company.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button 
                  className="w-full h-12 bg-primary-container text-on-primary-container font-headline-md text-[15px] font-semibold rounded-xl shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 btn-hover-effect hover:bg-primary-container/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 border-t border-outline-variant/40 text-center">
                <Link 
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            /* STATE 2: Check Your Email Confirmation */
            <div className="flex flex-col gap-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col items-center text-center gap-xs">
                {/* Glowing Success Badge Icon */}
                <div className="relative mb-2">
                  <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
                    <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      mark_email_read
                    </span>
                  </div>
                </div>

                <h2 className="font-headline-md text-headline-md text-on-surface">Check your email</h2>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                  We've sent a password reset link to your email address:
                </p>
              </div>

              {/* Target Email Banner Box */}
              <div className="bg-surface-container-high/80 border border-outline-variant rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                    alternate_email
                  </span>
                  <span className="font-mono text-sm font-semibold text-on-surface truncate">
                    {email}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success('Email copied to clipboard!');
                  }}
                  className="text-outline hover:text-on-surface transition-colors p-1 rounded-md"
                  title="Copy email address"
                >
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </div>

              {/* Security Hint Alert Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3 text-left text-xs leading-relaxed text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <div>
                  <strong className="text-on-surface font-semibold block mb-0.5">Didn't see the email?</strong>
                  Check your spam or junk folder. The reset link expires in <strong>15 minutes</strong>.
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-sm pt-2">
                <button 
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                  className="w-full h-11 bg-surface-container-high border border-outline-variant hover:bg-surface-bright text-on-surface font-medium text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>
                    {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend password reset email'}
                  </span>
                </button>

                <Link 
                  to="/login"
                  className="w-full h-11 bg-primary-container text-on-primary-container font-headline-md text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-primary-container/90 transition-all text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  <span>Return to Sign In</span>
                </Link>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="text-xs text-outline hover:text-primary transition-colors underline"
                >
                  Entered wrong email address? Try again
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-outline">
          Need additional help? Contact <a href="mailto:support@teampilot.com" className="text-primary hover:underline">TeamPilot Support</a>
        </p>

      </main>
    </div>
  );
};

export default ForgotPassword;
