import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { registerUser } from '../../api/authApi';
import { DESIGNATIONS } from '../../constants/appConstants';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (formData.name.length > 100) {
      toast.error('Full Name must not exceed 100 characters');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email Address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }
    if (formData.email.length > 150) {
      toast.error('Email must not exceed 150 characters');
      return;
    }
    if (!formData.password) {
      toast.error('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (formData.password.length > 100) {
      toast.error('Password must not exceed 100 characters');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account...');
    
    try {
      const response = await registerUser(formData);
      toast.success(response.message || 'User successfully registered! Redirecting...', { id: toastId });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to register. Please try again.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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
    for (let i = 0; i < 15; i++) {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-md sm:p-lg relative overflow-hidden bg-background text-on-background">
      {/* Main Registration Container */}
      <main className="w-full max-w-[480px] z-10">
        <div className="glass-panel rounded-xl p-lg sm:p-2xl shadow-2xl">
          {/* Branding */}
          <header className="mb-xl text-center">
            <div className="inline-flex items-center gap-sm mb-md">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md tracking-tight">TeamPilot</h1>
            </div>
            <h2 className="font-headline-lg text-headline-lg mb-xs">Create your account</h2>
            <p className="font-body-md text-on-surface-variant">Start collaborating with intelligent workflows today.</p>
          </header>

          {/* Social OAuth Action */}
          <button 
            type="button" 
            className="w-full h-12 flex items-center justify-center gap-sm bg-surface-container-high border border-outline-variant hover:bg-surface-bright transition-colors rounded-lg mb-lg group"
            onClick={() => {
              const baseUrl = import.meta.env.VITE_API_URL || '';
              window.location.href = `${baseUrl}/oauth2/authorization/google`;
            }}
          >
            <svg className="mr-2" height="20" viewBox="0 0 24 24" width="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-body-md font-medium">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-md mb-lg">
            <div className="h-px flex-1 bg-outline-variant"></div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-widest text-[10px]">Or with email</span>
            <div className="h-px flex-1 bg-outline-variant"></div>
          </div>

          {/* Form */}
          <form className="space-y-lg" onSubmit={handleRegisterSubmit}>
            <div className="space-y-xs text-left">
              <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'name' ? 'text-[#b4c5ff]' : 'text-outline'
                  }`}
                >
                  person
                </span>
                <input 
                  className="input-field w-full h-12 pl-10 pr-4 rounded-lg font-body-md placeholder:text-outline-variant text-on-background" 
                  id="name" 
                  name="name" 
                  placeholder="John Doe" 
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-xs text-left">
              <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-[#b4c5ff]' : 'text-outline'
                  }`}
                >
                  mail
                </span>
                <input 
                  className="input-field w-full h-12 pl-10 pr-4 rounded-lg font-body-md placeholder:text-outline-variant text-on-background" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div className="space-y-xs text-left">
              <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="designation">
                Designation (Optional)
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'designation' ? 'text-[#b4c5ff]' : 'text-outline'
                  }`}
                >
                  badge
                </span>
                <select 
                  className="input-field w-full h-12 pl-10 pr-8 rounded-lg font-body-md text-on-background cursor-pointer" 
                  id="designation" 
                  name="designation" 
                  value={formData.designation}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('designation')}
                  onBlur={() => setFocusedField(null)}
                >
                  <option value="" className="bg-[#191b23] text-outline-variant">Select designation...</option>
                  {DESIGNATIONS.map((designation) => (
                    <option key={designation} value={designation} className="bg-[#191b23]">
                      {designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-xs text-left">
              <label className="font-label-sm text-on-surface-variant block ml-xs" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-[#b4c5ff]' : 'text-outline'
                  }`}
                >
                  lock
                </span>
                <input 
                  className="input-field w-full h-12 pl-10 pr-12 rounded-lg font-body-md placeholder:text-outline-variant text-on-background" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button 
              className="w-full h-12 bg-primary-container hover:brightness-110 active:scale-[0.98] transition-all rounded-lg text-white font-body-md font-bold shadow-lg shadow-primary-container/20 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          {/* Legal & Navigation */}
          <footer className="mt-xl space-y-md text-center">
            <p className="font-label-sm text-on-surface-variant leading-relaxed px-sm">
              By signing up, you agree to our{' '}
              <a className="text-primary hover:underline" href="#">Terms of Service</a>{' '}
              and{' '}
              <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
            </p>
            <div className="h-px w-12 bg-outline-variant mx-auto"></div>
            <p className="font-body-md">
              Already have an account?{' '}
              <Link className="text-primary font-bold hover:underline" to="/login">
                Sign in instead
              </Link>
            </p>
          </footer>
        </div>

        {/* Secondary Decoration */}
        <div className="mt-lg flex justify-between items-center px-sm opacity-50">
          <span className="font-label-sm text-on-surface-variant">v2.4.0-stable</span>
          <div className="flex gap-md">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            <span className="material-symbols-outlined text-[18px]">security</span>
          </div>
        </div>
      </main>

      {/* Side Decoration (Bento Style Preview) - Only visible on desktop */}
      <aside className="hidden xl:flex absolute right-lg top-1/2 -translate-y-1/2 w-[380px] flex-col gap-lg z-10 text-left">
        <div className="glass-panel p-md rounded-xl space-y-md border-l-4 border-l-primary shadow-xl">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant">
              <img 
                alt="User" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-AZXki1T9gQBf1dIcv6fEh-Eqe6NmmVDoS0oSLsP-6cwq4lLHGiBH2yi8oLPpFm2nxL_ylxYjoT214Scr0EEXIkgcnLCr0cMxvFxH3-WF2_eXZuVbIo311pk199ifqi-BhkWZPf60VhFv-V9tQ57KVrcmFRtv7xqskigR7mgkmvA7_qy-T7egrmUFLYcfIEV0u9su1Ujx2atywdM1Ud7-8OIRs9UW8nxNjY2f0FtFve_8K9QkplpI9VXRND6-KqKIvzqwwMKEBd7R" 
              />
            </div>
            <div className="flex-1">
              <div className="h-2 w-24 bg-outline-variant rounded-full mb-1"></div>
              <div className="h-1.5 w-16 bg-outline-variant/50 rounded-full"></div>
            </div>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <p className="font-body-md italic text-on-surface-variant">
            "The automated workspace setup saved our engineering team dozens of hours in the first week."
          </p>
        </div>
        <div className="glass-panel p-md rounded-xl space-y-md border-l-4 border-l-tertiary-container translate-x-12">
          <div className="flex justify-between items-center">
            <span className="font-label-sm text-tertiary">Active Projects</span>
            <span className="material-symbols-outlined text-tertiary">monitoring</span>
          </div>
          <div className="flex gap-xs">
            <div className="h-12 flex-1 bg-surface-container-highest rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant">folder</span>
            </div>
            <div className="h-12 flex-1 bg-surface-container-highest rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant">folder</span>
            </div>
            <div className="h-12 flex-1 bg-primary-container/20 rounded border border-primary/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">add</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;