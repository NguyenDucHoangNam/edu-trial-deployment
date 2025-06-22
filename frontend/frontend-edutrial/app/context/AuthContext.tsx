// app/context/AuthContext.tsx

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Giữ nguyên kiểu dữ liệu UserInfo
export type UserInfo = {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  gender: string | null;
  phone: string | null;
  dob: string | null;
  address: string | null;
  description: string | null;
  zipCode: string | null;
  enabled: boolean;
  role: string;
};

// 1. Thêm hàm updateUser vào kiểu AuthContextType
type AuthContextType = {
  isLoggedIn: boolean;
  user: UserInfo | null;
  token: string | null; // Thêm token vào đây để các component khác có thể truy cập
  login: (user: UserInfo, token: string) => void;
  logout: () => void;
  updateUser: (newUserData: UserInfo) => void; // <-- THÊM DÒNG NÀY
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (storedToken && userData) {
      setUser(JSON.parse(userData));
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (userData: UserInfo, token: string) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setToken(token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  // 2. Định nghĩa hàm updateUser
  const updateUser = (newUserData: UserInfo) => {
    // Cập nhật state của React
    setUser(newUserData);
    // Cập nhật lại localStorage với thông tin mới
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  return (
    // 3. Cung cấp token và updateUser trong value
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};