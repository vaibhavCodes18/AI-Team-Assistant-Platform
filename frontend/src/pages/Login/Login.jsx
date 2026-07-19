import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUser } from '../../api/authApi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error('Email Address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Invalid email format');
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

    setLoading(true);
    const toastId = toast.loading('Authenticating...');

    try {
      const response = await loginUser(formData);
      if (response?.data?.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      toast.success(response.message || 'Successfully logged in!', { id: toastId });
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Invalid email or password.';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    <div className="min-h-screen flex items-center justify-center p-md md:p-lg mesh-gradient text-on-background relative overflow-hidden">
      {/* Background Animation Layer (Subtle Mesh) */}
      <div className="fixed inset-0 pointer-events-none opacity-40"></div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-[440px] flex flex-col gap-lg">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">AI Team Hub</h1>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-xl p-lg md:p-xl shadow-2xl flex flex-col gap-lg">
          <div className="flex flex-col gap-xs text-left">
            <h2 className="font-headline-md text-headline-md text-on-surface">Welcome back</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your workspace.</p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-md" onSubmit={handleLoginSubmit}>
            {/* Email Input */}
            <div className="flex flex-col gap-xs text-left">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="email">
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
                  className="w-full h-12 pl-10 pr-4 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-outline font-body-md input-focus-ring transition-all" 
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

            {/* Password Input */}
            <div className="flex flex-col gap-xs text-left">
              <div className="flex justify-between items-center">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <a 
                  className="font-label-sm text-label-sm text-primary hover:underline transition-all" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.success('Forgot password logic simulated!');
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span 
                  className={`material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-[#b4c5ff]' : 'text-outline'
                  }`}
                >
                  lock
                </span>
                <input 
                  className="w-full h-12 pl-10 pr-12 bg-surface-container-low border border-outline-variant rounded-lg text-on-surface placeholder:text-outline font-body-md input-focus-ring transition-all" 
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

            {/* Remember Me */}
            <div className="flex items-center gap-sm text-left">
              <input 
                className="w-4 h-4 rounded border-outline-variant bg-surface-container-low text-primary-container focus:ring-primary-container focus:ring-offset-background" 
                id="remember" 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="font-body-md text-body-md text-on-surface-variant select-none" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-sm pt-sm">
              <button 
                className="w-full h-12 bg-primary-container text-on-primary-container font-headline-md text-[16px] rounded-lg shadow-md flex items-center justify-center gap-sm btn-hover-effect hover:bg-primary-container/90 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>

              <div className="relative py-md">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-outline-variant"></span>
                </div>
                <div className="relative flex justify-center text-label-sm uppercase">
                  <span className="bg-surface-container px-sm text-outline font-label-sm">Or continue with</span>
                </div>
              </div>

              <button 
                className="w-full h-12 bg-surface-container-high border border-outline-variant text-on-surface font-body-md font-semibold rounded-lg flex items-center justify-center gap-sm btn-hover-effect hover:bg-surface-bright transition-colors" 
                type="button"
                onClick={() => window.location.href = '/oauth2/authorization/google'}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation */}
        <p className="text-center font-body-md text-body-md text-on-surface-variant">
          Don't have an account?{' '}
          <Link className="text-primary font-semibold hover:underline transition-all" to="/register">
            Create an account
          </Link>
        </p>

        {/* Visual Sub-content */}
        <div className="mt-xl grid grid-cols-3 gap-md opacity-30">
          <div className="h-1 bg-outline-variant rounded-full"></div>
          <div className="h-1 bg-primary rounded-full"></div>
          <div className="h-1 bg-outline-variant rounded-full"></div>
        </div>
      </main>

      {/* Decorative Image (Mobile Hidden) */}
      <div className="hidden lg:flex fixed top-0 right-0 w-1/3 h-full overflow-hidden opacity-20 pointer-events-none">
        <img 
          className="object-cover w-full h-full grayscale mix-blend-screen" 
          alt="Neural Network Mesh" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCN2efzz6Il1DDa-rv02ngf2U6QkCmZOHjDxxsgcmPgE0lmFt4UYwnVGwV51W873fXkVBgItlxoWVTfsFbRaBqcdVGEqrM0I3Sjd7x0713aMe_tICdu52yQee0Up5ptEV0c5Ml6ZNbekbPbM9gMkS6LdLsR3SjPL-7ekZ0oNNwNbV-6NBe29juQ3xgQR06X_Xk2URHLWNEMFkRyf9Zyn-fXMHpD35JPbUkXJcgUHYdGsa686UpJaUac2BGVM7V6jqN3sXr_uorXAKFj" 
        />
      </div>
    </div>
  );
};

export default Login;