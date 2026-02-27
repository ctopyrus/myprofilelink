
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, Key, Bell, Trash2, Mail, User, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  user: UserProfile;
}

const rawApiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl.slice(0, -4)
  : rawApiBaseUrl;

export const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [usernameError, setUsernameError] = useState('');
  
  const handleSaveUsername = async () => {
      const username = newUsername.trim().toLowerCase();
      if (!username) {
          setUsernameStatus('error');
          setUsernameError('Username is required.');
          return;
      }

      const token = localStorage.getItem('mpl_token') || localStorage.getItem('token');
      if (!token) {
          setUsernameStatus('error');
          setUsernameError('You are not authenticated.');
          return;
      }

      setUsernameStatus('saving');
      setUsernameError('');

      try {
          const res = await fetch(`${API_BASE_URL}/api/user/update`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ username }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
              throw new Error(data.error || 'Failed to update username.');
          }

          setEditingUsername(false);
          setUsernameStatus('saved');
      } catch (error: any) {
          setUsernameStatus('error');
          setUsernameError(error?.message || 'Failed to update username.');
      }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

      {/* Live Preview */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
              <div className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">Your Live Link</div>
              <a href={`/${user.username}`} target="_blank" className="text-lg font-black text-gray-900 hover:underline">
                  myprofilelink.in/<span className="text-brand-600">{user.username}</span>
              </a>
          </div>
          <div className="flex items-center gap-4">
              {user.isVerified ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                      <ShieldCheck size={16}/> Verified
                  </div>
              ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                      <AlertCircle size={16}/> Unverified
                  </div>
              )}
              <a href={`/${user.username}`} target="_blank" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 border border-gray-100">
                  Open Page
              </a>
          </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <User size={18} className="text-gray-500"/> Profile Details
            </h2>
        </div>
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username / Handle</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            disabled={!editingUsername} 
                            value={newUsername} 
                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                            className={`w-full p-2 border rounded text-sm ${editingUsername ? 'bg-white border-brand-500 ring-2 ring-brand-100 text-gray-900' : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'}`} 
                        />
                        {editingUsername ? (
                            <button onClick={handleSaveUsername} className="bg-brand-600 text-white px-3 rounded text-sm font-bold">Save</button>
                        ) : (
                            <button onClick={() => setEditingUsername(true)} className="bg-gray-100 text-gray-600 px-3 rounded text-sm font-bold border border-gray-200 hover:bg-gray-200">Edit</button>
                        )}
                    </div>
                    {editingUsername && <p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertCircle size={12}/> Changing this will break your existing links.</p>}
                    {usernameStatus === 'saved' && (
                      <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                        <Check size={12}/> Username updated.
                      </p>
                    )}
                    {usernameStatus === 'error' && usernameError && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={12}/> {usernameError}
                      </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                            <Mail size={16}/>
                        </span>
                        <input type="email" disabled value={user.email} className="flex-1 p-2 bg-gray-100 border border-gray-300 rounded-r-md text-gray-500 cursor-not-allowed" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Shield size={18} className="text-gray-500"/> Security
            </h2>
        </div>
        <div className="p-6 space-y-6">
            <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Change Password</h3>
                <div className="space-y-3 max-w-md">
                    <input type="password" placeholder="Current Password" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                    <input type="password" placeholder="New Password" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                    <input type="password" placeholder="Confirm New Password" className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-2 focus:ring-brand-500" />
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Update Password
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-xl shadow-sm border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-100/50">
            <h2 className="font-bold text-red-900 flex items-center gap-2">
                <Trash2 size={18} className="text-red-700"/> Danger Zone
            </h2>
        </div>
        <div className="p-6 flex items-center justify-between">
            <div>
                <div className="text-sm font-medium text-red-900">Delete Account</div>
                <div className="text-xs text-red-600">Once you delete your account, there is no going back. Please be certain.</div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700">
                Delete Account
            </button>
        </div>
      </div>
    </div>
  );
};
export default Settings;
