import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OAuth2Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts[1].split(';').shift();
      }
      return null;
    };

    // Try to get token from query parameter first, then cookie, then localStorage (resilient to StrictMode mounts)
    const params = new URLSearchParams(window.location.search);
    let accessToken = params.get('access_token');
    
    if (!accessToken) {
      accessToken = getCookie('access_token');
    }

    if (accessToken) {
      // Store token in localStorage
      localStorage.setItem('accessToken', accessToken);

      toast.success('Successfully authenticated with Google!');
      
      // Delay navigation slightly to let the toast display
      const timeout = setTimeout(() => {
        navigate('/profile');
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      toast.error('Authentication failed: Access token not found.');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-md md:p-lg mesh-gradient text-on-background relative overflow-hidden">
      {/* Background Animation Layer (Subtle Mesh) */}
      <div className="fixed inset-0 pointer-events-none opacity-40"></div>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-[440px] flex flex-col gap-lg items-center text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-sm">
          <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-on-primary-container text-[28px] animate-spin" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-md">Completing sign-in</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Please wait while we secure your session...</p>
        </div>
      </main>
    </div>
  );
};

export default OAuth2Success;
