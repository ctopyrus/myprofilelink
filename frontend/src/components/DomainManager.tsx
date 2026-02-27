import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AlertCircle, CheckCircle, Globe, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DomainManagerProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;

export const DomainManager: React.FC<DomainManagerProps> = ({ user, onUpdate }) => {
  const [domainInput, setDomainInput] = useState(user.customDomain || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(Boolean(user.customDomain));

  const handleSave = () => {
    const normalized = domainInput.trim().toLowerCase();
    if (!normalized) {
      setError('Domain is required.');
      return;
    }

    if (!DOMAIN_PATTERN.test(normalized)) {
      setError('Enter a valid domain like links.example.com');
      return;
    }

    setError('');
    setSaved(true);
    onUpdate({ ...user, customDomain: normalized });
  };

  const handleRemove = () => {
    setDomainInput('');
    setError('');
    setSaved(false);
    onUpdate({ ...user, customDomain: undefined });
  };

  if (user.plan !== 'business') {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 text-white text-center shadow-2xl">
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Globe size={40} className="text-brand-300" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-4">
              Connect Your Own Domain
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Custom domains are available on the Business plan.
            </p>
            <Link
              to="/checkout?plan=business"
              className="block w-full bg-white text-gray-900 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Upgrade to Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Domain Management
        </h1>
        <p className="text-gray-500 font-medium">
          Save your domain and point DNS records. Status turns live after DNS propagation.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
            Your Custom Domain
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Globe
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={domainInput}
                onChange={(e) => {
                  setDomainInput(e.target.value);
                  setSaved(false);
                }}
                placeholder="e.g. links.yourwebsite.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-8 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Save Domain
            </button>
            {user.customDomain && (
              <button
                onClick={handleRemove}
                className="px-6 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100"
              >
                Remove
              </button>
            )}
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold mt-3 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          {saved && !error && (
            <p className="text-emerald-600 text-sm font-bold mt-3 flex items-center gap-2">
              <CheckCircle size={16} /> Domain saved. Complete DNS records below.
            </p>
          )}
        </div>

        <div className="p-8 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Server size={18} className="text-brand-600" /> DNS Configuration
          </h3>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Name / Host</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">TTL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">A</td>
                  <td className="px-6 py-4 font-mono text-gray-600">@</td>
                  <td className="px-6 py-4 font-mono text-gray-600">76.76.21.21</td>
                  <td className="px-6 py-4 text-gray-500">Auto</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">CNAME</td>
                  <td className="px-6 py-4 font-mono text-gray-600">www</td>
                  <td className="px-6 py-4 font-mono text-gray-600">cname.myprofilelink.in</td>
                  <td className="px-6 py-4 text-gray-500">Auto</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm border border-blue-100">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold mb-1">Propagation note</p>
              <p className="opacity-80">
                DNS updates can take up to 24 hours globally.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainManager;
