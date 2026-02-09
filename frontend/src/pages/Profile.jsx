import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiUser, HiEnvelope, HiShieldCheck, HiBuildingLibrary, HiBuildingOffice2 } from 'react-icons/hi2';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authAPI.getProfile();
        setProfile(res.data.user);
        setName(res.data.user.name);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await authAPI.updateProfile({ name }); toast.success('Profile updated!'); }
    catch (error) { toast.error('Update failed'); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner h-10 w-10"></div></div>;

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500">Manage your account information</p>
      </div>

      {/* Avatar Card */}
      <div className="card overflow-hidden">
        <div className="bg-blue-600 px-6 py-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center text-xl font-bold text-white">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.name}</h2>
            <p className="text-white/70 text-sm">{profile?.email}</p>
            <span className="text-xs font-medium bg-white/15 text-white px-2 py-0.5 rounded-md uppercase mt-1.5 inline-block">
              {profile?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Edit Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <HiUser className="h-4 w-4 text-gray-400" /> Name
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <HiEnvelope className="h-4 w-4 text-gray-400" /> Email
            </label>
            <input type="email" value={profile?.email || ''} disabled
              className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
              <HiShieldCheck className="h-4 w-4 text-gray-400" /> Role
            </label>
            <input type="text" value={profile?.role?.replace('_', ' ') || ''} disabled
              className="input-field bg-gray-50 text-gray-400 cursor-not-allowed capitalize" />
          </div>
          {profile?.institution && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <HiBuildingLibrary className="h-4 w-4 text-gray-400" /> Institution
              </label>
              <input type="text" value={profile.institution.name || ''} disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          )}
          {profile?.department && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <HiBuildingOffice2 className="h-4 w-4 text-gray-400" /> Department
              </label>
              <input type="text" value={profile.department.name || ''} disabled
                className="input-field bg-gray-50 text-gray-400 cursor-not-allowed" />
            </div>
          )}
          <div className="pt-2">
            <button type="submit" className="btn-primary">Update Profile</button>
          </div>
        </form>
      </div>
    </div>
  );
}
