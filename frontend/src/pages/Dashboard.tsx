import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

import Sidebar from '../components/Sidebar';
import Analytics from '../components/Analytics';
import Settings from '../components/Settings';
import DomainManager from '../components/DomainManager';
import TemplateGallery from '../components/TemplateGallery';
import AdvancedEditor from '../components/AdvancedEditor';
import CompanyAdminPanel from '../components/CompanyAdminPanel';
import PlanUpgradeModal from '../components/PlanUpgradeModal';
import { SubscriptionPlan, UserProfile } from '../types';

type Tab =
  | 'overview'
  | 'editor'
  | 'analytics'
  | 'domains'
  | 'templates'
  | 'company'
  | 'settings';

const Dashboard = () => {
  const { user, subscription, profile, setProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPro =
    subscription &&
    subscription.status === 'active' &&
    (subscription.plan === 'pro' || subscription.plan === 'business');

  if (!profile) {
    return null;
  }

  const handleProFeatureAccess = () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return false;
    }
    return true;
  };

  const handleTemplateSelect = (templateData: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...(templateData.style ? { style: templateData.style } : {}),
      ...(templateData.blocks ? { blocks: templateData.blocks } : {}),
    };
    setProfile(updated);
  };

  const handleDomainUpdate = (updatedUser: UserProfile) => {
    setProfile(updatedUser);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Analytics user={profile} />;

      case 'editor':
        if (!handleProFeatureAccess()) return null;
        if (!profile) return null;
        return (
          <AdvancedEditor
            profile={profile}
            setProfile={setProfile}
          />
        );

      case 'analytics':
        if (!handleProFeatureAccess()) return null;
        if (!profile) return null;
        return <Analytics user={profile} />;

      case 'domains':
        if (!handleProFeatureAccess()) return null;
        if (!profile) return null;
        return (
          <DomainManager
            user={profile}
            onUpdate={handleDomainUpdate}
          />
        );

      case 'templates':
        if (!profile) return null;
        return (
          <TemplateGallery
            user={profile}
            onSelect={handleTemplateSelect}
          />
        );

      case 'company':
        if (user?.role !== 'admin') {
          return <p>You do not have access to this section.</p>;
        }
        return <CompanyAdminPanel />;

      case 'settings':
        return <Settings user={profile} />;

      default:
        if (!profile) return null;
        return <Analytics user={profile} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              subscription={(subscription?.plan || 'free') as SubscriptionPlan}
              user={profile}
              onLogout={logout}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.name || user?.displayName || 'Creator'}
            </h1>
            <p className="text-gray-600">
              Current Plan:{' '}
              <span className="font-semibold">
                {subscription?.plan || 'free'}
              </span>
            </p>
          </div>

          {!isPro && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          {renderContent()}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <PlanUpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
