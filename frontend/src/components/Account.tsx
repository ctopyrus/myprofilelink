
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { CreditCard, Calendar, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AccountProps {
  user: UserProfile;
}

export const Account: React.FC<AccountProps> = ({ user }) => {
  const navigate = useNavigate();
  const isFree = user.plan === 'free';
  const isPro = user.plan === 'pro';
  const isBusiness = user.plan === 'business';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account & Billing</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Plan Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-brand-600" size={20}/> Current Plan
              </h2>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                  <div>
                      <div className="text-2xl font-extrabold text-gray-900 capitalize">{user.plan}</div>
                      <div className="text-sm text-gray-500">
                          {isFree && 'Basic features. Watermarked.'}
                          {isPro && '₹399/mo. No watermark + 5 AI Gens.'}
                          {isBusiness && '₹699/mo. Unlimited Power.'}
                      </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isFree ? 'bg-gray-200 text-gray-700' : 'bg-brand-100 text-brand-700'}`}>
                      Active
                  </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-4">
                  <div>
                      <div className="flex justify-between text-sm font-medium mb-1">
                          <span>AI Generations Used</span>
                          <span>{user.aiGenerationCount} / {isFree ? '0' : isPro ? '5' : '∞'}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${user.aiGenerationCount >= 5 && !isBusiness ? 'bg-red-500' : 'bg-brand-500'}`} 
                            style={{ width: isBusiness ? '5%' : `${Math.min((user.aiGenerationCount / 5) * 100, 100)}%` }}
                          ></div>
                      </div>
                      {isFree && <p className="text-xs text-red-500 mt-1">Upgrade to unlock AI generation.</p>}
                  </div>
              </div>

              <div className="mt-8 flex gap-3">
                  {isFree && (
                      <button 
                        onClick={() => navigate('/pricing')} 
                        className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors"
                      >
                          Upgrade to Pro (₹399)
                      </button>
                  )}
                  {!isBusiness && (
                       <button 
                        onClick={() => navigate('/pricing')} 
                        className="bg-gray-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition-colors"
                       >
                          Upgrade to Business (₹699)
                      </button>
                  )}
                  {!isFree && (
                      <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
                          Manage Subscription
                      </button>
                  )}
              </div>
          </div>

          {/* Billing Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
               <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="text-gray-400" size={20}/> Billing
              </h2>
              {isFree ? (
                  <div className="text-center py-8 text-gray-500">
                      <p>You are on the free plan.</p>
                      <p className="text-sm">No payment method required.</p>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded">
                             <CreditCard size={16} />
                          </div>
                          <div>
                              <div className="text-sm font-bold">•••• 4242</div>
                              <div className="text-xs text-gray-500">Expires 12/25</div>
                          </div>
                      </div>
                      <div className="border-t border-gray-100 pt-4">
                          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                              <Calendar size={14}/> Next Billing Date
                          </div>
                          <div className="font-bold text-gray-900">
                              {new Date(new Date().setDate(new Date().getDate() + 25)).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-brand-600 mt-1 font-medium">25 days remaining</div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Feature Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${isFree ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div>
                      <div className="font-bold">No Watermark</div>
                      <div className="text-gray-500">{isFree ? 'Not Active' : 'Active'}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${isBusiness ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                      <div className="font-bold">Custom Domain</div>
                      <div className="text-gray-500">{isBusiness ? 'Active' : 'Upgrade Required'}</div>
                  </div>
              </div>
               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${!isFree ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                      <div className="font-bold">Priority Support</div>
                      <div className="text-gray-500">{!isFree ? 'Active' : 'Standard'}</div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
