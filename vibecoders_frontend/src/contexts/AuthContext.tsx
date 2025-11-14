import { loginApi, registerApi, getProfileApi } from '@/util/auth.api';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
interface User {
    userId: string;
    userName: string;
    email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const data = await getProfileApi();
          setUser(data);
        } catch (err) {
          console.error("Failed to fetch profile (token might be expired):", err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem("access_token", data.accessToken);
    localStorage.setItem("refresh_token", data.refreshToken);
    console.log("Login user data:", data.userDto);
    setUser(data.userDto);
  };

  const signup = async (name: string, email: string, password: string) => {
    const data = await registerApi(name, email, password);
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading, }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
