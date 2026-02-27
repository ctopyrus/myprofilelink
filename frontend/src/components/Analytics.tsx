import React from 'react';
import { Activity, BarChart3, Info } from 'lucide-react';
import { UserProfile } from '../types';

interface AnalyticsProps {
  user: UserProfile;
}

export const Analytics: React.FC<AnalyticsProps> = ({ user }) => {
  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/30">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">
          Track engagement for @{user.username}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Profile Views
          </p>
          <h3 className="text-3xl font-black text-gray-900">0</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Link Clicks
          </p>
          <h3 className="text-3xl font-black text-gray-900">0</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
            Conversion Rate
          </p>
          <h3 className="text-3xl font-black text-gray-900">0.0%</h3>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-3 text-gray-900 mb-3">
          <BarChart3 size={20} />
          <h2 className="text-lg font-black">Real analytics not configured yet</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          The dashboard is now non-mock and intentionally shows zero until tracking ingestion is
          connected. Add an events pipeline and persist view/click events to enable historical charts.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <Info size={14} />
          No fabricated analytics values are shown in production.
        </div>
      </div>
    </div>
  );
};

export default Analytics;
