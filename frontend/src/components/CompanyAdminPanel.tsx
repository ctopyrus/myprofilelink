import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Shield, Trash2, Check, X, Search, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

const USERS_KEY = 'mpl_users_db';
const CURRENT_USER_KEY = 'mpl_current_user';

export const CompanyAdminPanel = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }
    }, []);

    const handleDeleteUser = (email: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(u => u.email !== email);
            setUsers(updatedUsers);
            localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        navigate('/login');
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: users.length,
        pro: users.filter(u => u.plan === 'pro').length,
        business: users.filter(u => u.plan === 'business').length,
        revenue: users.reduce((acc, u) => acc + (u.plan === 'pro' ? 399 : u.plan === 'business' ? 699 : 0), 0)
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200">
                            Admin Console
                        </span>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Total Users</div>
                        <div className="text-3xl font-black text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-2">Pro Users</div>
                        <div className="text-3xl font-black text-brand-600">{stats.pro}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Business Users</div>
                        <div className="text-3xl font-black text-indigo-600">{stats.business}</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Est. Revenue</div>
                        <div className="text-3xl font-black text-emerald-600">₹{stats.revenue.toLocaleString()}</div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-900">User Database</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search users..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-full sm:w-64"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.email} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm">{user.displayName}</div>
                                                    <div className="text-xs text-gray-400">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                user.plan === 'business' ? 'bg-indigo-100 text-indigo-700' : 
                                                user.plan === 'pro' ? 'bg-brand-100 text-brand-700' : 
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {new Date(user.joinedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isVerified ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><Check size={14}/> Verified</span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">Unverified</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(user.email)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No users found matching "{searchTerm}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default CompanyAdminPanel;