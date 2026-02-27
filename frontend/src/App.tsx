import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { Hero } from './components/Hero';
import { TemplateGallery } from './components/TemplateGallery';
import { Editor } from './components/Editor';
import { AdvancedEditor } from './components/AdvancedEditor';
import { Preview } from './components/Preview';
import { Footer } from './components/Footer';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Sidebar } from './components/Sidebar';
import { Analytics } from './components/Analytics';
import { Account } from './components/Account';
import { Settings } from './components/Settings';
import { DomainManager } from './components/DomainManager';
import { AdvancedEditorUpgrade } from './components/AdvancedEditorUpgrade';
import { Logo } from './components/Logo';
import { CompanyAdminPanel } from './components/CompanyAdminPanel';
import { Checkout } from './components/Checkout';
import { PricingPage, ExamplesPage, FAQPage, ContactPage } from './components/PublicPages';
import { UserProfile } from './types';

import {
  Menu,
  X,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Mail,
  CheckCircle,
  AlertTriangle,
  Lock,
  Wifi,
  WifiOff,
  Database,
} from 'lucide-react';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PlanProtectedRoute from './routes/PlanProtectedRoute';

import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import UpgradePage from './pages/UpgradePage';
import Dashboard from './pages/Dashboard';

// Declare gtag on window
declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}

// --- CONFIG ---
const rawApiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE_URL = rawApiBaseUrl.endsWith('/api')
  ? rawApiBaseUrl.slice(0, -4)
  : rawApiBaseUrl;

// Password validation regex
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validatePassword = (
  password: string,
): { valid: boolean; message: string } => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 8)
    return {
      valid: false,
      message: 'Password must be at least 8 characters',
    };
  if (!/[a-z]/.test(password))
    return {
      valid: false,
      message: 'Password must contain lowercase letters',
    };
  if (!/[A-Z]/.test(password))
    return {
      valid: false,
      message: 'Password must contain uppercase letters',
    };
  if (!/\d/.test(password))
    return {
      valid: false,
      message: 'Password must contain numbers',
    };
  if (!/[@$!%*?&]/.test(password))
    return {
      valid: false,
      message:
        'Password must contain special characters (@$!%*?&)',
    };
  return { valid: true, message: '' };
};

const DEFAULT_PROFILE: UserProfile = {
  uid: '',
  username: 'demo',
  email: '',
  displayName: 'Demo User',
  bio: 'Creator | Designer | Dreamer',
  avatarUrl: 'https://picsum.photos/200?grayscale',
  blocks: [],
  style: {
    backgroundType: 'solid',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff',
    buttonStyle: 'rounded',
    fontFamily: 'Inter',
    layoutMode: 'list',
  },
  role: 'creator',
  plan: 'free',
  subscriptionStatus: 'active',
  isVerified: false,
  joinedAt: new Date().toISOString(),
  onboardingCompleted: false,
  aiGenerationCount: 0,
};

// ---------------- Auth-related Pages ----------------

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [msg, setMsg] = useState('');
  const getVerificationErrorMessage = (
    statusCode: number,
    backendError?: string,
  ) => {
    const raw = (backendError || '').toLowerCase();
    if (
      statusCode === 503 ||
      raw.includes('buffering timed out') ||
      raw.includes('mongonetworkerror') ||
      raw.includes('eai_again')
    ) {
      return 'Verification service is temporarily unavailable. Please try again in a minute.';
    }
    return backendError || 'Verification failed';
  };

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMsg('No verification token provided.');
      return;
    }

    const encodedToken = encodeURIComponent(token);
    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${encodedToken}`)
      .then(async (res) => {
        let data: { message?: string; error?: string } = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (res.ok) {
          setStatus('success');
          setMsg(data.message || 'Email verified successfully.');
        } else {
          setStatus('error');
          setMsg(getVerificationErrorMessage(res.status, data.error));
        }
      })
      .catch(() => {
        setStatus('error');
        setMsg('Could not connect to server.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">
              Verifying Email...
            </h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verified!
            </h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link
              to="/login"
              className="block w-full bg-brand-600 text-white py-3 rounded-xl font-bold"
            >
              Continue to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-500 mb-6">{msg}</p>
            <Link
              to="/login"
              className="text-brand-600 font-bold hover:underline"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Check your inbox
          </h2>
          <p className="text-gray-500 mb-6">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link
            to="/login"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-500 mb-6">
          Enter your email to receive a reset link.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
            required
          />
          {status === 'error' && (
            <p className="text-red-500 text-xs font-bold">
              Something went wrong. Try again.
            </p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-6">
          <Link
            to="/login"
            className="text-sm font-bold text-gray-500 hover:text-gray-900"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.valid) {
      setError('Password does not meet requirements');
      return;
    }

    if (!token) {
      setError('Invalid reset link');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword }),
        },
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Reset failed');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setError('Network error');
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-gray-500 mb-6">
            This password reset link is invalid or expired.
          </p>
          <Link
            to="/forgot-password"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Password Reset!
          </h2>
          <p className="text-gray-500 mb-6">
            Your password has been successfully reset. You can now log in
            with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Reset Password
        </h2>
        <p className="text-gray-500 mb-6">
          Enter your new password below.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, lowercase, number, special char"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all ${
                passwordValidation.valid && newPassword
                  ? 'border-emerald-200 focus:ring-emerald-500'
                  : newPassword
                  ? 'border-red-200 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-brand-500'
              }`}
              required
            />
            {newPassword && (
              <div
                className={`mt-2 text-xs font-bold space-y-1 ${
                  passwordValidation.valid
                    ? 'text-emerald-600'
                    : 'text-red-600'
                }`}
              >
                <p
                  className={
                    !/[a-z]/.test(newPassword)
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  ✓ Lowercase letters
                </p>
                <p
                  className={
                    !/[A-Z]/.test(newPassword)
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  ✓ Uppercase letters
                </p>
                <p
                  className={
                    !/\d/.test(newPassword)
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  ✓ Numbers
                </p>
                <p
                  className={
                    !/[@$!%*?&]/.test(newPassword)
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  ✓ Special characters (@$!%*?&)
                </p>
                <p
                  className={
                    newPassword.length < 8
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }
                >
                  ✓ At least 8 characters
                </p>
              </div>
            )}
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center">
                {error}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={
              status === 'loading' || !passwordValidation.valid
            }
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <div className="mt-6">
          <Link
            to="/login"
            className="text-sm font-bold text-gray-500 hover:text-gray-900"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

// ---------------- Layout / Navigation ----------------

const EarlyBirdBanner: React.FC = () => (
  <div className="bg-gray-900 text-white py-2.5 px-4 text-center relative z-[60] border-b border-gray-800">
    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
      <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[10px]">
        New
      </div>
      <span>Advanced Editor & AI Themes are now live!</span>
      <Link
        to="/signup"
        className="hidden sm:inline-flex items-center ml-2 text-brand-300 hover:text-white font-bold transition-colors"
      >
        Get Started <ArrowRight size={14} className="ml-1" />
      </Link>
    </div>
  </div>
);

const Navigation: React.FC<{
  isAuthenticated: boolean;
  isAdmin: boolean;
}> = ({ isAuthenticated, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setIsOpen(false), [location]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
          <div className="flex items-center">
            <Logo />
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                to="/pricing"
                className="text-gray-500 hover:text-gray-900 text-sm font-bold tracking-tight"
              >
                Pricing
              </Link>
              <Link
                to="/examples"
                className="text-gray-500 hover:text-gray-900 text-sm font-bold tracking-tight"
              >
                Examples
              </Link>
              {isAdmin && (
                <Link
                  to="/admin-panel"
                  className="text-brand-600 font-black text-sm flex items-center gap-1.5"
                >
                  <ShieldCheck size={16} /> Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:ml-6 space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 font-bold text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-800 transition-all shadow-lg hover:shadow-gray-200"
                >
                  Claim Handle
                </Link>
              </>
            ) : (
              <Link
                to="/admin"
                className="bg-brand-50 text-brand-700 px-6 py-2.5 rounded-full text-sm font-black border border-brand-100 hover:bg-brand-100 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden absolute w-full bg-white border-b border-gray-200 shadow-xl py-6 px-4 space-y-4 animate-fadeIn z-50">
          <Link
            to="/pricing"
            className="block text-lg font-bold text-gray-900"
          >
            Pricing
          </Link>
          <Link
            to="/examples"
            className="block text-lg font-bold text-gray-900"
          >
            Examples
          </Link>
          {isAdmin && (
            <Link
              to="/admin-panel"
              className="block text-lg font-black text-brand-600"
            >
              Admin Panel
            </Link>
          )}
          <div className="pt-4 border-t border-gray-100">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center py-3 font-bold text-gray-700"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center bg-gray-900 text-white py-3 rounded-xl font-bold"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <Link
                to="/admin"
                className="block w-full text-center bg-brand-600 text-white py-3 rounded-xl font-bold"
              >
                My Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const AuthenticatedLayout: React.FC<{
  children: React.ReactNode;
  user: UserProfile;
  onLogout: () => void;
}> = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setSidebarOpen(false), [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar
              user={user}
              onLogout={onLogout}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)} activeTab={'overview'} setActiveTab={function (value: React.SetStateAction<'overview' | 'editor' | 'analytics' | 'domains' | 'templates' | 'company' | 'settings'>): void {
                  throw new Error('Function not implemented.');
              } } subscription={'pro'}      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs uppercase overflow-hidden">
            <img
              src={user.avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
};

// ---------------- Auth Screens ----------------

const LoginPage: React.FC<{
  onLogin: (user: UserProfile) => void;
}> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [isDbOffline, setIsDbOffline] = useState(false);
  const [connStatus, setConnStatus] = useState<
    'checking' | 'connected' | 'db_offline' | 'offline'
  >('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        const data = await res.json();
        if (res.ok && data.dbState === 1) {
          setConnStatus('connected');
          setIsDbOffline(false);
        } else {
          setConnStatus('db_offline');
          setIsDbOffline(true);
        }
      } catch {
        setConnStatus('offline');
      }
    };
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnverified(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        if (data.needsVerification) setIsUnverified(true);
        return;
      }

      localStorage.setItem('mpl_token', data.accessToken);
      localStorage.setItem('token', data.accessToken);

      if (window.gtag) {
        window.gtag('event', 'login', { method: 'email' });
      }

      onLogin(data.user);
    } catch {
      setError('Network Error or Server Offline');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Continue building your bio.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-brand-600 hover:text-brand-800 uppercase tracking-wide"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <div
              className={`p-4 rounded-xl border text-sm font-medium ${
                isUnverified
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isUnverified ? (
                  <AlertTriangle size={16} />
                ) : (
                  <X size={16} />
                )}
                <span className="font-bold">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isDbOffline}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-black text-sm hover:bg-black transition-all shadow-lg hover:shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDbOffline ? 'Maintenance Mode' : 'Access Dashboard'}
          </button>

          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              New here? Create your handle →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const SignupPage: React.FC<{
  onSignup: (user: UserProfile) => void;
}> = ({ onSignup }) => {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState(
    searchParams.get('username') || '',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.valid) {
      setError('Password does not meet requirements');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (window.gtag) {
        window.gtag('event', 'sign_up', { method: 'email' });
      }

      setSuccess(true);
    } catch {
      setError('Network Error');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Check your email!
          </h2>
          <p className="text-gray-500 mb-6">
            We&apos;ve sent a verification link to{' '}
            <strong>{email}</strong>. Please click it to activate your
            account.
          </p>
          <Link
            to="/login"
            className="block w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">
            Get Started
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            Join the creator collective.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Handle
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500 transition-all">
                <span className="text-gray-400 font-bold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="flex-1 bg-transparent outline-none ml-1 text-sm font-bold"
                  placeholder="yourname"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="name@email.com"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all ${
                  passwordValidation.valid && password
                    ? 'border-emerald-200 focus:ring-emerald-500'
                    : password
                    ? 'border-red-200 focus:ring-red-500'
                    : 'border-gray-200 focus:ring-brand-500'
                }`}
                placeholder="Min 8 chars, uppercase, lowercase, number, special char"
              />
              {password && (
                <div
                  className={`mt-2 text-xs font-bold space-y-1 ${
                    passwordValidation.valid
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  <p
                    className={
                      !/[a-z]/.test(password)
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }
                  >
                    ✓ Lowercase letters
                  </p>
                  <p
                    className={
                      !/[A-Z]/.test(password)
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }
                  >
                    ✓ Uppercase letters
                  </p>
                  <p
                    className={
                      !/\d/.test(password)
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }
                  >
                    ✓ Numbers
                  </p>
                  <p
                    className={
                      !/[@$!%*?&]/.test(password)
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }
                  >
                    ✓ Special characters (@$!%*?&)
                  </p>
                  <p
                    className={
                      password.length < 8
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }
                  >
                    ✓ At least 8 characters
                  </p>
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-500 text-xs font-bold text-center leading-relaxed">
                {error}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-black text-sm hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-100 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Claim Handle'}
          </button>
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-bold text-gray-500 hover:text-gray-900"
            >
              Already a creator? Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- MAIN APP (with AuthProvider + routes) ----------------

const AppInner: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] =
    useState<UserProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    const token = localStorage.getItem('mpl_token') || localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProfile(data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('mpl_token');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('mpl_token');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setProfile(user);
    setIsAuthenticated(true);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('mpl_token');
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setProfile(DEFAULT_PROFILE);
    navigate('/');
  };

  const updateProfileWrapper = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    const token = localStorage.getItem('mpl_token') || localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/user/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          blocks: newProfile.blocks,
          style: newProfile.style,
          displayName: newProfile.displayName,
          bio: newProfile.bio,
          avatarUrl: newProfile.avatarUrl,
          customDomain: newProfile.customDomain,
        }),
      });
    } catch (err) {
      console.error('Failed to sync profile', err);
    }
  };

  const isAdmin = profile.role === 'admin';

  return (
    <div className="min-h-screen font-sans text-gray-900 bg-white">
      {profile.plan === 'free' && !isAuthenticated && (
        <EarlyBirdBanner />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />
              <main className="flex-grow">
                <Hero />
                <PricingPage />
              </main>
              <Footer />
            </div>
          }
        />

        <Route
          path="/pricing"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />
              <main className="flex-grow">
                <PricingPage />
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/examples"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />
              <main className="flex-grow">
                <ExamplesPage />
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/faq"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />
              <main className="flex-grow">
                <FAQPage />
              </main>
              <Footer />
            </div>
          }
        />
        <Route
          path="/contact"
          element={
            <div className="flex flex-col min-h-screen">
              <Navigation
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />
              <main className="flex-grow">
                <ContactPage />
              </main>
              <Footer />
            </div>
          }
        />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin" />
            ) : (
              <LoginPage onLogin={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              <Navigate to="/admin" />
            ) : (
              <SignupPage onSignup={handleAuthSuccess} />
            )
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Old Checkout component (if still used) */}
        <Route path="/checkout-legacy" element={<Navigate to="/checkout" />} />

        {/* New plan-based checkout routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/success"
          element={
            <ProtectedRoute>
              <SuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cancel"
          element={
            isAuthenticated ? <Navigate to="/upgrade" /> : <Navigate to="/pricing" />
          }
        />
        <Route
          path="/upgrade"
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PlanProtectedRoute requiredPlan="pro">
              <Dashboard />
            </PlanProtectedRoute>
          }
        />

        <Route
          path="/admin-panel"
          element={
            isAuthenticated && isAdmin ? (
              <CompanyAdminPanel />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              !profile.onboardingCompleted ? (
                <OnboardingWizard
                  user={profile}
                  onComplete={updateProfileWrapper}
                />
              ) : (
                <AuthenticatedLayout
                  user={profile}
                  onLogout={handleLogout}
                >
                  <Analytics user={profile} />
                </AuthenticatedLayout>
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/editor"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                <Editor
                  profile={profile}
                  setProfile={updateProfileWrapper}
                />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Advanced editor route – choose one behavior you want */}
        <Route
          path="/admin/advanced-editor"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                {profile?.plan === 'business' ? (
                  <Editor
                    profile={profile}
                    setProfile={updateProfileWrapper}
                  />
                ) : (
                  <AdvancedEditorUpgrade user={profile} />
                )}
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/templates"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                <TemplateGallery
                  onSelect={(updatedTemplateData) => {
                    const newProfile = { ...profile };
                    if (updatedTemplateData.style) {
                      newProfile.style = updatedTemplateData.style;
                    }
                    if (updatedTemplateData.blocks) {
                      newProfile.blocks = updatedTemplateData.blocks;
                    }
                    updateProfileWrapper(newProfile);
                  }}
                  user={profile}
                />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/account"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                <Account user={profile} />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/domain"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                <DomainManager
                  user={profile}
                  onUpdate={updateProfileWrapper}
                />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/settings"
          element={
            isAuthenticated ? (
              <AuthenticatedLayout
                user={profile}
                onLogout={handleLogout}
              >
                <Settings user={profile} />
              </AuthenticatedLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/:username"
          element={<Preview profile={profile} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
