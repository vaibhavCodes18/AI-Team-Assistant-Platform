import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { fetchUserProfile, logoutUser, updateUserProfile } from '../../api/authApi';
import Sidebar from '../../components/layout/Sidebar';
import { DESIGNATIONS } from '../../constants/appConstants';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    profileImage: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchUserProfile();
        const profile = data?.data;
        if (profile) {
          setUser(profile);
          setFormData({
            name: profile.name || '',
            designation: profile.designation || '',
            profileImage: profile.profileImage || '',
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        console.error('[Profile Debug] Error response:', error.response);
        toast.error('Failed to fetch profile information');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (formData.name.length > 100) {
      toast.error('Full Name must not exceed 100 characters');
      return;
    }
    if (formData.designation.length > 100) {
      toast.error('Designation must not exceed 100 characters');
      return;
    }
    if (formData.profileImage.length > 255) {
      toast.error('Profile Image URL must not exceed 255 characters');
      return;
    }

    try {
      setSaving(true);
      const res = await updateUserProfile(formData);
      if (res?.data) {
        setUser(res.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const logoutRes = await logoutUser();
      toast.success(logoutRes?.msg || 'Logged out successfully');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-on-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-body-md text-on-surface-variant animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* SideNavBar Component */}
      <Sidebar handleLogout={handleLogout} />

      {/* Main Content Area */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {/* TopNavBar Component */}
        <header className="flex justify-between items-center h-16 px-gutter w-full sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant">
          <div className="flex items-center gap-lg">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input 
                className="bg-surface-container border-none text-on-surface text-body-md rounded-lg py-2 pl-10 pr-4 w-64 focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-surface outline-none transition-all" 
                placeholder="Search tasks, docs..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center p-2 text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
              title="Sign Out"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2 flex items-center justify-center bg-primary-container text-on-primary-container font-semibold text-xs">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name)
              )}
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="flex-1 overflow-y-auto p-gutter pb-24 md:pb-gutter custom-scrollbar">
          <div className="max-w-container-max mx-auto space-y-xl">
            {/* Page Header */}
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Account Profile</h1>
              <p className="text-on-surface-variant font-body-md mt-xs">Manage your personal information and profile settings.</p>
            </div>

            {/* Profile Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
              
              {/* Profile Card Summary Panel (4 columns) */}
              <div className="lg:col-span-4 bg-surface-container border border-outline-variant p-lg rounded-xl flex flex-col items-center text-center gap-lg relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="text-[10px] uppercase font-bold text-green-400">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="relative mt-md">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container-high flex items-center justify-center text-on-primary-container text-display font-display select-none">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user?.name)
                    )}
                  </div>
                </div>

                <div className="space-y-xs">
                  <h2 className="font-headline-md text-headline-md text-on-surface">{user?.name}</h2>
                  <p className="text-primary font-semibold text-body-md tracking-wide uppercase">
                    {user?.designation || 'Team Member'}
                  </p>
                  <div className="inline-block px-3 py-0.5 mt-sm text-xs font-semibold rounded-full bg-secondary-container/40 text-secondary border border-outline-variant">
                    {user?.platformRole || 'USER'}
                  </div>
                </div>

                <hr className="w-full border-outline-variant" />

                <div className="w-full space-y-md text-left text-body-md">
                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                    <div className="min-w-0">
                      <p className="text-on-surface-variant text-label-sm uppercase font-label-sm">Email Address</p>
                      <p className="text-on-surface font-semibold truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">calendar_month</span>
                    <div>
                      <p className="text-on-surface-variant text-label-sm uppercase font-label-sm">Member Since</p>
                      <p className="text-on-surface font-semibold">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-md">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">vpn_key</span>
                    <div>
                      <p className="text-on-surface-variant text-label-sm uppercase font-label-sm">Auth Provider</p>
                      <p className="text-on-surface font-semibold capitalize">{user?.provider || 'Local'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Form Panel (8 columns) */}
              <div className="lg:col-span-8 bg-surface-container border border-outline-variant rounded-xl p-lg space-y-lg">
                <div className="flex justify-between items-center border-b border-outline-variant pb-md">
                  <h3 className="text-on-surface font-headline-md text-headline-md">
                    {isEditing ? 'Edit Profile Details' : 'Profile Information'}
                  </h3>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    {/* Full Name */}
                    <div className="flex flex-col gap-xs text-left">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="name">
                        Full Name
                      </label>
                      <input 
                        className={`w-full h-12 px-4 rounded-lg text-on-surface font-body-md transition-all ${
                          isEditing 
                            ? 'bg-surface-container-low border border-outline-variant input-focus-ring' 
                            : 'bg-surface-container-high border border-transparent cursor-not-allowed'
                        }`}
                        id="name" 
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing || saving}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Designation */}
                    <div className="flex flex-col gap-xs text-left">
                      <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="designation">
                        Designation
                      </label>
                      <select 
                        className={`w-full h-12 px-4 rounded-lg text-on-surface font-body-md transition-all cursor-pointer ${
                          isEditing 
                            ? 'bg-surface-container-low border border-outline-variant input-focus-ring' 
                            : 'bg-surface-container-high border border-transparent cursor-not-allowed'
                        }`}
                        id="designation" 
                        name="designation"
                        value={formData.designation}
                        onChange={handleInputChange}
                        disabled={!isEditing || saving}
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

                  {/* Profile Image URL */}
                  <div className="flex flex-col gap-xs text-left">
                    <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block" htmlFor="profileImage">
                      Profile Image URL
                    </label>
                    <input 
                      className={`w-full h-12 px-4 rounded-lg text-on-surface font-body-md transition-all ${
                        isEditing 
                          ? 'bg-surface-container-low border border-outline-variant input-focus-ring' 
                          : 'bg-surface-container-high border border-transparent cursor-not-allowed'
                      }`}
                      id="profileImage" 
                      name="profileImage"
                      type="url"
                      value={formData.profileImage}
                      onChange={handleInputChange}
                      disabled={!isEditing || saving}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {isEditing && formData.profileImage && (
                      <div className="mt-sm flex items-center gap-md p-sm bg-surface-container-low border border-outline-variant rounded-lg">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant flex-shrink-0">
                          <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Invalid';
                          }} />
                        </div>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">Image Preview</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex justify-end gap-md pt-md border-t border-outline-variant">
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name || '',
                            designation: user.designation || '',
                            profileImage: user.profileImage || '',
                          });
                        }}
                        className="px-4 py-2 border border-outline-variant hover:bg-surface-container-high text-on-surface font-bold rounded-lg transition-colors"
                        disabled={saving}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-xs"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">save</span>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>

                {/* Additional read-only metadata section */}
                <div className="pt-lg border-t border-outline-variant space-y-md text-left">
                  <h4 className="text-on-surface-variant font-bold font-label-sm text-label-sm uppercase tracking-wide">
                    Workspace and Access Info
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-body-md bg-surface-container-high p-md rounded-lg border border-outline-variant">
                    <div>
                      <p className="text-on-surface-variant font-label-sm text-label-sm uppercase">Platform Role</p>
                      <p className="text-on-surface font-semibold">{user?.platformRole || 'Standard Member'}</p>
                    </div>
                    <div>
                      <p className="text-on-surface-variant font-label-sm text-label-sm uppercase">Account Status</p>
                      <p className="text-on-surface font-semibold flex items-center gap-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                        Active and Verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation (BottomNavBar substitute for mobile view) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-outline-variant flex items-center justify-around z-50">
        <Link to="/" className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px]">Dashboard</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">workspaces</span>
          <span className="text-[10px]">Work</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <div className="w-10 h-10 -mt-8 bg-primary rounded-full flex items-center justify-center shadow-lg text-on-primary">
            <span className="material-symbols-outlined">add</span>
          </div>
          <span className="text-[10px]">New</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px]">Alerts</span>
        </button>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default Profile;
