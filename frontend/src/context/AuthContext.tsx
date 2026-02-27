import { createContext, useEffect, useState, ReactNode } from "react";
import API from "../services/api";
import { UserProfile } from "../types";

interface User {
  displayName: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd: string;
}


export type AuthContextType = {
  user: User | null;
  subscription: Subscription | null;
  profile: UserProfile | null;
  isLoading: boolean;
  setProfile: (profile: UserProfile) => void;
  login: (token: string) => void;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (token: string) => {
    localStorage.setItem("mpl_token", token);
    localStorage.setItem("token", token);
    fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("mpl_token");
    localStorage.removeItem("token");
    setUser(null);
    setSubscription(null);
  };

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/user/me");
      const payload = res.data?.user || res.data;
      setUser(payload);
      await refreshSubscription();
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      const res = await API.get("/user/subscription");
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("mpl_token") || localStorage.getItem("token");
    if (token) {
      fetchUser();
      return;
    }
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, subscription, profile, isLoading, setProfile, login, logout, refreshSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
};
