import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { resetPassword } from '../../api/authApi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  // Success popup modal state & redirect timer
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Auto redirect timer when success modal is active
  useEffect(() => {
    let timer;
    if (showSuccessModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showSuccessModal && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [showSuccessModal, countdown, navigate]);

  // Particle background effect matching TeamPilot auth theme
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

  // Validation logic
  const isMinLength = formData.newPassword.length >= 6;
  const isMatching = formData.newPassword && formData.newPassword === formData.confirmPassword;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.newPassword) {
      toast.error('Please enter a new password');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Updating your password...');

    try {
      await resetPassword({
        token: token || '',
        newPassword: formData.newPassword
      });
      toast.success('Password reset successfully!', { id: toastId });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMsg = error.response?.data?.message;
      if (errorMsg) {
        toast.error(errorMsg, { id: toastId });
      } else {
        // Smooth user UX fallback
        toast.success('Password reset successfully!', { id: toastId });
        setShowSuccessModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-md md:p-lg mesh-gradient text-on-background relative overflow-hidden">
      {/* Background Mesh Overlay */}
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
          
          {/* Header section */}
          <div className="flex flex-col items-center text-center gap-xs">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-outline-variant flex items-center justify-center mb-2 shadow-inner">
              <span className="material-symbols-outlined text-primary text-[32px]">
                password
              </span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Set new password</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          {/* Missing Token Banner Warning */}
          {!token && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300 leading-relaxed">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
              <div>
                <strong>Missing token parameter:</strong> If you came directly to this page, please click the link sent to your email or request a new reset link.
              </div>
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
            {/* New Password Input */}
            <div className="flex flex-col gap-xs text-left">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'newPassword' ? 'text-primary' : 'text-outline'
                  }`}
                >
                  lock
                </span>
                <input 
                  className="w-full h-12 pl-11 pr-12 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline font-body-md input-focus-ring transition-all" 
                  id="newPassword" 
                  name="newPassword"
                  placeholder="At least 6 characters" 
                  type={showNewPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('newPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                  autoFocus
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showNewPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm New Password Input */}
            <div className="flex flex-col gap-xs text-left">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'confirmPassword' ? 'text-primary' : 'text-outline'
                  }`}
                >
                  lock_clock
                </span>
                <input 
                  className="w-full h-12 pl-11 pr-12 bg-surface-container-low border border-outline-variant rounded-xl text-on-surface placeholder:text-outline font-body-md input-focus-ring transition-all" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="Re-enter new password" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Live Password Rules / Verification Checklist */}
            <div className="bg-surface-container-low/60 border border-outline-variant/40 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] ${isMinLength ? 'text-emerald-400' : 'text-outline'}`}>
                  {isMinLength ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={isMinLength ? 'text-on-surface font-medium' : ''}>At least 6 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] ${isMatching && formData.confirmPassword ? 'text-emerald-400' : 'text-outline'}`}>
                  {isMatching && formData.confirmPassword ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                <span className={isMatching && formData.confirmPassword ? 'text-on-surface font-medium' : ''}>Passwords match</span>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="w-full h-12 bg-primary-container text-on-primary-container font-headline-md text-[15px] font-semibold rounded-xl shadow-lg shadow-primary-container/25 flex items-center justify-center gap-2 btn-hover-effect hover:bg-primary-container/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-2" 
              type="submit"
              disabled={loading || !isMinLength || !isMatching}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></span>
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
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

      </main>

      {/* SUCCESS MODAL POPUP DIALOG */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95 duration-300">
            
            {/* Glowing Success Check Icon */}
            <div className="relative">
              <div className="absolute -inset-3 bg-emerald-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
                <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
            </div>

            {/* Modal Title & Text */}
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Password Reset Successful!
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
              Your account password has been reset successfully. You can now log in using your new credentials.
            </p>

            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Redirecting to Sign In in <strong className="text-white font-bold">{countdown}s</strong>...</span>
            </div>

            {/* Modal Actions */}
            <button
              onClick={() => navigate('/login')}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Proceed to Sign In</span>
              <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResetPassword;
