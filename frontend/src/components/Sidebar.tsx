
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Edit3, LayoutTemplate, LogOut, ExternalLink, Settings, BarChart2, CreditCard, X, ChevronRight, User, Globe, Lock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { Dispatch, SetStateAction } from "react";
import { SubscriptionPlan } from "../types";

type Tab =
  | "overview"
  | "editor"
  | "analytics"
  | "domains"
  | "templates"
  | "company"
  | "settings";

interface SidebarProps {
  user: UserProfile;
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  subscription: SubscriptionPlan;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, subscription, onLogout, isOpen = false, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label, locked = false }: { to: string, icon: any, label: string, locked?: boolean }) => {
      const active = isActive(to);
      return (
        <Link 
        to={to} 
        onClick={onClose}
        className={`flex items-center justify-between px-4 py-3 mx-4 rounded-xl transition-all duration-200 group relative ${
            active 
            ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
        >
        <div className="flex items-center gap-3 relative z-10">
            <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? 'text-brand-300' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className={`text-sm ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {locked && <Lock size={14} className="text-gray-300" />}
            {active && <ChevronRight size={14} className="text-gray-500 opacity-50"/>}
        </div>
        </Link>
      );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-[70] transition-transform duration-300 ease-in-out w-72 lg:w-72 lg:translate-x-0 shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="p-8 pb-6 flex items-center justify-between">
          <Logo />
          <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 space-y-8 overflow-y-auto hide-scrollbar py-2">
          <div className="space-y-1">
              <div className="px-8 pb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60">Create</div>
              <NavItem to="/admin" icon={BarChart2} label="Analytics" />
              <NavItem to="/admin/editor" icon={Edit3} label="Editor" />
              <NavItem to="/admin/templates" icon={LayoutTemplate} label="Templates" />
              <NavItem to="/admin/advanced-editor" icon={Sparkles} label="Advanced Editor" locked={user.plan !== 'business'} />
          </div>
          
          <div className="space-y-1">
              <div className="px-8 pb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] opacity-60">Settings</div>
              <NavItem to="/admin/account" icon={CreditCard} label="Billing & Plan" />
              <NavItem to="/admin/domain" icon={Globe} label="Custom Domain" locked={user.plan !== 'business'} />
              <NavItem to="/admin/settings" icon={Settings} label="Preferences" />
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 mx-4 mb-6">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
             <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-600 font-bold text-xs shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                     {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : <User size={18}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">@{user.username}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{user.plan} Plan</div>
                  </div>
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                  <a 
                      href={`/${user.username}`} 
                      target="_blank" 
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-all"
                  >
                      <ExternalLink size={14} /> View
                  </a>
                  <button 
                      onClick={onLogout}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                      <LogOut size={14} /> Exit
                  </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;